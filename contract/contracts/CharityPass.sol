// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CharityPass is ERC721Enumerable, Ownable {
    using Strings for uint256;

    string public baseUri = "https://resources.smarttokenlabs.com/";

    constructor(string memory name, string memory symbol) Ownable(msg.sender) ERC721(name, symbol) {}

    function mint(uint256 tokenId) public onlyOwner {
        _mint(owner(), tokenId);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        return
            string(
                abi.encodePacked(baseUri, block.chainid.toString(), "/", _contractAddress(), "/", tokenId.toString())
            );
    }

    function _contractAddress() internal view returns (string memory) {
        return Strings.toHexString(uint160(address(this)), 20);
    }
}
