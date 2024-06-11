// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CharityPoints is ERC20, Ownable {
    constructor(uint256 initialBalance) ERC20("CharityPoints", "CPT") Ownable(msg.sender) {
        _mint(msg.sender, initialBalance);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
