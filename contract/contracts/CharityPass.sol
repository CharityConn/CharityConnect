// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import {ERC5169} from "stl-contracts/ERC/ERC5169.sol";

contract CharityPass is ERC5169, ERC721Enumerable, Ownable {
    using Strings for uint256;

    string public baseUri = "https://resources.smarttokenlabs.com/";

    // wallet -> claimed count
    mapping(address => uint) public claimedByWallet;

    uint256 private _nextTokenId = 0;

    constructor(
        string memory name,
        string memory symbol
    ) Ownable(msg.sender) ERC721(name, symbol) {}

    function _authorizeSetScripts(string[] memory) internal override onlyOwner {}

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC5169, ERC721Enumerable) returns (bool) {
        return interfaceId == type(IERC721Enumerable).interfaceId || ERC5169.supportsInterface(interfaceId);
    }

    function claim() public {
        address to = _msgSender();
        
        require(claimedByWallet[to] == 0, "Already claimed");

        claimedByWallet[to] += 1;
        _mint(to, _nextTokenId);
        _nextTokenId++;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        return
            string(
                abi.encodePacked(baseUri, block.chainid.toString(), "/", _contractAddress(), "/", tokenId.toString())
            );
    }

    function setBaseUri(string memory uri) external onlyOwner {
        baseUri = uri;
    }

    function resetClaimedByWallet(address wallet) public onlyOwner {
        claimedByWallet[wallet] = 0;
    }

    function _contractAddress() internal view returns (string memory) {
        return Strings.toHexString(uint160(address(this)), 20);
    }
}
