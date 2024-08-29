// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import {ERC5169Upgradable, ERC5169} from "stl-contracts/ERC/ERC5169Upgradable.sol";

contract Charityeet is
    Initializable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable,
    ERC5169Upgradable
{
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    function initialize(string memory name, string memory symbol, uint256 initialSupply) public initializer {
        __ERC20_init(name, symbol);
        __ERC20Burnable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _mint(msg.sender, initialSupply);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    function _authorizeSetScripts(string[] memory) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    function mint(address to, uint256 amount) public onlyRole(MANAGER_ROLE) {
        _mint(to, amount);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC5169, AccessControlUpgradeable) returns (bool) {
        return
            interfaceId == type(IERC20).interfaceId ||
            ERC5169.supportsInterface(interfaceId) ||
            AccessControlUpgradeable.supportsInterface(interfaceId);
    }
}
