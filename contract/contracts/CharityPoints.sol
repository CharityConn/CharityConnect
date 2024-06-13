// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import {ERC5169} from "stl-contracts/ERC/ERC5169.sol";

contract CharityPoints is ERC5169, ERC20, Ownable {
    constructor(uint256 initialBalance) ERC20("CharityPoints", "CPT") Ownable(msg.sender) {
        _mint(msg.sender, initialBalance);
    }

    function _authorizeSetScripts(string[] memory) internal override onlyOwner {}

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC5169) returns (bool) {
        return interfaceId == type(IERC20).interfaceId || ERC5169.supportsInterface(interfaceId);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
