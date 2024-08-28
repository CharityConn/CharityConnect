// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract DonationManager is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    uint constant QUICK_DONATION_AMOUNT = 0.001 ether;

    // eth donation is under zeroAddress
    mapping(uint => mapping(address => uint)) public donationByPassId;

    mapping(string => address) public charities;
    string[] internal charityNames;

    // 1 = 0.01%, eth fee rate is under zeroAddress
    mapping(address => uint) public feeRates;

    function initialize() public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        feeRates[address(0)] = 50;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

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

        payable(getRandomCharityAddress()).transfer(QUICK_DONATION_AMOUNT);
    }

    function getRandomCharityAddress() internal view returns (address) {
        require(charityNames.length > 0, "No charity available");

        uint256 randomIndex = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao))) %
            charityNames.length;

        return charities[charityNames[randomIndex]];
    }

    function calculateDonationAmount(address token, uint amount) public view returns (uint) {
        return (amount * 10000) / (10000 + feeRates[token]);
    }
}
