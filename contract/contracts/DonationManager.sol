// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {Charityeet} from "./Charityeet.sol";

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract DonationManager is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    uint constant QUICK_DONATION_AMOUNT = 0.001 ether;
    uint constant RATE_DENOMINATOR = 10000;

    // eth donation is under zeroAddress
    mapping(uint => mapping(address => uint)) public donationByPassId;

    mapping(string => address) public charities;
    string[] internal charityNames;

    // 1 = 0.01%, eth fee rate is under zeroAddress
    mapping(address => uint) public feeRates;

    // 1 = 0.01%, eth fee rate is under zeroAddress
    mapping(address => uint) public rewardRates;

    address public rewardToken;

    function initialize(address rewardTokenAddress) public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        rewardToken = rewardTokenAddress;

        feeRates[address(0)] = 50;
        rewardRates[address(0)] = 2.5 * 3000 * RATE_DENOMINATOR;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    function setRewardToken(address rewardTokenAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        rewardToken = rewardTokenAddress;
    }

    function setCharityWallet(string memory name, address charityWallet) public onlyRole(DEFAULT_ADMIN_ROLE) {
        charityNames.push(name);
        charities[name] = charityWallet;
    }

    function setFeeRate(address token, uint rate) public onlyRole(DEFAULT_ADMIN_ROLE) {
        feeRates[token] = rate;
    }

    function quickDonate(uint passId) public payable {
        uint netAmount = calculateDonationAmount(address(0), msg.value);

        require(netAmount == QUICK_DONATION_AMOUNT, "incorrect quick donation amount");

        donationByPassId[passId][address(0)] += QUICK_DONATION_AMOUNT;

        string memory charity = getRandomCharity();

        Charityeet(rewardToken).mint(msg.sender, calculateRewardAmount(charity, address(0), QUICK_DONATION_AMOUNT));
        payable(charities[charity]).transfer(QUICK_DONATION_AMOUNT);
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
