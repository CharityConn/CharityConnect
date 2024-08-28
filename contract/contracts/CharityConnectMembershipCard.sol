// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import {ERC5169Upgradable, ERC5169} from "stl-contracts/ERC/ERC5169Upgradable.sol";

contract CharityConnectMembershipCard is
    Initializable,
    ERC721EnumerableUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable,
    ERC5169Upgradable
{
    using Strings for uint256;

    string public baseUri;

    // wallet -> claimed count
    mapping(address => uint) public claimedByWallet;

    uint256 private _nextTokenId;

    function initialize(string memory name, string memory symbol) public initializer {
        __ERC721_init(name, symbol);
        __ERC721Enumerable_init();
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();

        baseUri = "https://resources.smarttokenlabs.com/";
        _nextTokenId = 0;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function _authorizeSetScripts(string[] memory) internal override onlyOwner {}

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC5169, ERC721EnumerableUpgradeable) returns (bool) {
        return ERC5169.supportsInterface(interfaceId) || ERC721EnumerableUpgradeable.supportsInterface(interfaceId);
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
