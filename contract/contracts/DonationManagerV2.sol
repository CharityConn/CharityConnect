// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {ICharityeet} from "./ICharityeet.sol";

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

contract DonationManagerV2 is Initializable, AccessControlUpgradeable, UUPSUpgradeable, ReentrancyGuardUpgradeable {
    uint constant QUICK_DONATION_AMOUNT = 0.001 ether;
    uint constant RATE_DENOMINATOR = 10000;

    address public rewardToken;
    address public membershipCard;

    // eth donation is under zeroAddress
    mapping(uint => mapping(address => uint)) public donationByCardId;

    // charity name hash => charity wallet
    mapping(bytes32 => address) public charities;
    string[] internal charityNames;

    // 1 = 0.01%, eth fee rate is under zeroAddress
    mapping(address => uint) public feeRates;

    // 1 = 0.01%, eth fee rate is under zeroAddress
    mapping(address => uint) public rewardRates;

    // business id => charityeet amount burned against the business
    mapping(string => uint) public burnedToBusiness;
    // charity hash => charityeet amount burned against charity
    mapping(bytes32 => uint) public burnedToCharity;
    // charityeet owner => charityeet amount burned to business
    mapping(address => uint) public burnedToBusinessFrom;
    // charityeet owner => charityeet amount burned to charity
    mapping(address => uint) public burnedToCharityFrom;

    event CharityUpdated(string indexed name, address account);
    event FeeRateUpdated(address indexed token, uint rate);
    event Donation(string indexed charity, uint indexed donorCardId, address token, uint amount, uint fee);
    event Withdrawal(address indexed to, address indexed token, uint amount);
    event BurnedToBusiness(string indexed businessId, address indexed from, uint amount);
    event BurnedToCharity(string indexed charity, address indexed from, uint amount);

    function initialize(address membershipCardAddress, address rewardTokenAddress) public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        rewardToken = rewardTokenAddress;
        membershipCard = membershipCardAddress;

        feeRates[address(0)] = 50;
        rewardRates[address(0)] = 2.5 * 3000 * RATE_DENOMINATOR;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    function setMembershipCard(address membershipCardAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        membershipCard = membershipCardAddress;
    }

    function setRewardToken(address rewardTokenAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        rewardToken = rewardTokenAddress;
    }

    function setCharityWallet(string calldata name, address charityWallet) external onlyRole(DEFAULT_ADMIN_ROLE) {
        bytes32 nameHash = keccak256(abi.encodePacked(name));

        charityNames.push(name);
        charities[nameHash] = charityWallet;

        emit CharityUpdated(name, charityWallet);
    }

    function getAllCharityNames() external view returns (string[] memory) {
        return charityNames;
    }

    function setFeeRate(address token, uint rate) external onlyRole(DEFAULT_ADMIN_ROLE) {
        feeRates[token] = rate;

        emit FeeRateUpdated(token, rate);
    }

    function setTokenRewardRate(address token, uint rate) external onlyRole(DEFAULT_ADMIN_ROLE) {
        rewardRates[token] = rate;
    }

    function quickDonate(uint cardId) external payable {
        uint netAmount = calculateDonationAmount(address(0), msg.value);

        require(netAmount == QUICK_DONATION_AMOUNT, "incorrect quick donation amount");
        require(IERC721(membershipCard).ownerOf(cardId) == msg.sender, "Membership card not owned by donor");

        string memory charity = getRandomCharity();
        bytes32 charityHash = keccak256(abi.encodePacked(charity));

        ICharityeet(rewardToken).mint(msg.sender, calculateRewardAmount(charity, address(0), QUICK_DONATION_AMOUNT));
        payable(charities[charityHash]).transfer(QUICK_DONATION_AMOUNT);

        donationByCardId[cardId][address(0)] += QUICK_DONATION_AMOUNT;

        emit Donation(charity, cardId, address(0), QUICK_DONATION_AMOUNT, msg.value - QUICK_DONATION_AMOUNT);
    }

    function donateETH(uint cardId, string calldata charity) external payable {
        bytes32 charityHash = keccak256(abi.encodePacked(charity));

        require(charities[charityHash] != address(0), "Unknown charity");
        require(IERC721(membershipCard).ownerOf(cardId) == msg.sender, "Membership card not owned by donor");

        uint netAmount = calculateDonationAmount(address(0), msg.value);

        ICharityeet(rewardToken).mint(msg.sender, calculateRewardAmount(charity, address(0), netAmount));
        payable(charities[charityHash]).transfer(netAmount);

        donationByCardId[cardId][address(0)] += netAmount;

        emit Donation(charity, cardId, address(0), netAmount, msg.value - netAmount);
    }

    function withdrawETH(address to, uint amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(amount <= address(this).balance, "Insufficient balance");

        payable(to).transfer(amount);

        emit Withdrawal(to, address(0), amount);
    }

    function burnToBusiness(string calldata businessId, uint amount) external {
        ICharityeet charityeet = ICharityeet(rewardToken);

        require(charityeet.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");

        charityeet.burnFrom(msg.sender, amount);

        burnedToBusiness[businessId] += amount;
        burnedToBusinessFrom[msg.sender] += amount;

        emit BurnedToBusiness(businessId, msg.sender, amount);
    }

    function burnToCharity(string calldata charity, uint amount) external {
        bytes32 charityHash = keccak256(abi.encodePacked(charity));
        ICharityeet charityeet = ICharityeet(rewardToken);

        require(charities[charityHash] != address(0), "Unknown charity");
        require(charityeet.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");

        charityeet.burnFrom(msg.sender, amount);

        burnedToCharity[charityHash] += amount;
        burnedToCharityFrom[msg.sender] += amount;

        emit BurnedToCharity(charity, msg.sender, amount);
    }

    function getRandomCharity() internal view returns (string memory) {
        require(charityNames.length > 0, "No charity available");

        uint256 randomIndex = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao))) %
            charityNames.length;

        return charityNames[randomIndex];
    }

    function calculateDonationAmount(address token, uint amount) public view returns (uint) {
        return (amount * RATE_DENOMINATOR) / (RATE_DENOMINATOR + feeRates[token]);
    }

    // TODO: expect more flexibility in the calcuation, taking charity, token, time, etc. into consideration
    function calculateRewardAmount(string memory charity, address token, uint amount) public view returns (uint) {
        bytes32 charityHash = keccak256(abi.encodePacked(charity));
        require(charities[charityHash] != address(0), "charity not found");

        return (amount * rewardRates[token]) / RATE_DENOMINATOR;
    }
}
