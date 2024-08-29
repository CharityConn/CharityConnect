// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {ICharityeet} from "./ICharityeet.sol";

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract DonationManager is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    uint constant QUICK_DONATION_AMOUNT = 0.001 ether;
    uint constant RATE_DENOMINATOR = 10000;

    address public rewardToken;
    address public membershipCard;

    // eth donation is under zeroAddress
    mapping(uint => mapping(address => uint)) public donationByCardId;

    mapping(string => address) public charities;
    string[] internal charityNames;

    // 1 = 0.01%, eth fee rate is under zeroAddress
    mapping(address => uint) public feeRates;

    // 1 = 0.01%, eth fee rate is under zeroAddress
    mapping(address => uint) public rewardRates;

    // charity name => charityeet amount burned against the charity
    mapping(string => uint) public burnedToCharity;
    uint public totalBurnedToCC;

    // charityeet owner => charityeet amount burned
    mapping(address => uint) public burnedFrom;

    event CharityUpdated(string indexed name, address account);
    event FeeRateUpdated(address indexed token, uint rate);
    event Donation(string indexed name, uint indexed donorCardId, address token, uint amount, uint fee);
    event Withdrawal(address indexed to, address indexed token, uint amount);
    event Burned(string indexed name, address indexed from, uint amount);

    function initialize(address membershipCardAddress, address rewardTokenAddress) public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        rewardToken = rewardTokenAddress;
        membershipCard = membershipCardAddress;

        feeRates[address(0)] = 50;
        rewardRates[address(0)] = 2.5 * 3000 * RATE_DENOMINATOR;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    function setMembershipCard(address membershipCardAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        membershipCard = membershipCardAddress;
    }

    function setRewardToken(address rewardTokenAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        rewardToken = rewardTokenAddress;
    }

    function setCharityWallet(string memory name, address charityWallet) public onlyRole(DEFAULT_ADMIN_ROLE) {
        charityNames.push(name);
        charities[name] = charityWallet;

        emit CharityUpdated(name, charityWallet);
    }

    function setFeeRate(address token, uint rate) public onlyRole(DEFAULT_ADMIN_ROLE) {
        feeRates[token] = rate;

        emit FeeRateUpdated(token, rate);
    }

    function setTokenRewardRate(address token, uint rate) public onlyRole(DEFAULT_ADMIN_ROLE) {
        rewardRates[token] = rate;
    }

    function quickDonate(uint cardId) public payable {
        uint netAmount = calculateDonationAmount(address(0), msg.value);

        require(netAmount == QUICK_DONATION_AMOUNT, "incorrect quick donation amount");
        require(
            IERC721(membershipCard).ownerOf(cardId) == msg.sender,
            "Membership card not owned by donor"
        );

        donationByCardId[cardId][address(0)] += QUICK_DONATION_AMOUNT;

        string memory charity = getRandomCharity();

        ICharityeet(rewardToken).mint(msg.sender, calculateRewardAmount(charity, address(0), QUICK_DONATION_AMOUNT));
        payable(charities[charity]).transfer(QUICK_DONATION_AMOUNT);

        emit Donation(charity, cardId, address(0), QUICK_DONATION_AMOUNT, msg.value - QUICK_DONATION_AMOUNT);
    }

    function donateETH(uint cardId, string memory charity) public payable {
        require(charities[charity] != address(0), "Unknown charity");
        require(
            IERC721(membershipCard).ownerOf(cardId) == msg.sender,
            "Membership card not owned by donor"
        );

        uint netAmount = calculateDonationAmount(address(0), msg.value);

        donationByCardId[cardId][address(0)] += netAmount;

        ICharityeet(rewardToken).mint(msg.sender, calculateRewardAmount(charity, address(0), netAmount));
        payable(charities[charity]).transfer(netAmount);

        emit Donation(charity, cardId, address(0), netAmount, msg.value - netAmount);
    }

    function withdrawETH(address to, uint amount) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(amount <= address(this).balance, "Insufficient balance");

        payable(to).transfer(amount);

        emit Withdrawal(to, address(0), amount);
    }

    function burnTo(string memory charity, uint amount) public {
        ICharityeet charityeet = ICharityeet(rewardToken);

        require(charities[charity] != address(0), "Unknown charity");
        require(charityeet.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");

        burnedToCharity[charity] += amount;
        burnedFrom[msg.sender] += amount;

        charityeet.burnFrom(msg.sender, amount);

        emit Burned(charity, msg.sender, amount);
    }

    function burn(uint amount) public {
        ICharityeet charityeet = ICharityeet(rewardToken);

        require(charityeet.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");

        totalBurnedToCC += amount;
        burnedFrom[msg.sender] += amount;

        charityeet.burnFrom(msg.sender, amount);

        emit Burned('', msg.sender, amount);
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
        require(charities[charity] != address(0), "charity not found");

        return (amount * rewardRates[token]) / RATE_DENOMINATOR;
    }
}
