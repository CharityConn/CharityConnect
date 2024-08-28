// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract DonationManager is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    // eth donation is under zeroAddress
    mapping(uint => mapping(address => uint)) public donationByPassId;

    mapping(string => address) public charities;
    string[] internal charityNames;

    function initialize() public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    function setCharityWallet(string memory name, address charityWallet) public onlyRole(DEFAULT_ADMIN_ROLE) {
        charityNames.push(name);
        charities[name] = charityWallet;
    }

    function quickDonate(uint passId) public payable {
        require(msg.value == 0.001 ether, "insufficient payment");

        donationByPassId[passId][address(0)] += msg.value;

        payable(getRandomCharityAddress()).transfer(msg.value);
    }

    function getRandomCharityAddress() internal view returns (address) {
        require(charityNames.length > 0, "No charity available");

        uint256 randomIndex = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao))) %
            charityNames.length;
        
        return charities[charityNames[randomIndex]];
    }
}
