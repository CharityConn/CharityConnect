// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface ICharityeet {
    function mint(address to, uint256 amount) external;

    function burnFrom(address account, uint256 value) external;

    function allowance(address owner, address spender) external view returns (uint256);
}
