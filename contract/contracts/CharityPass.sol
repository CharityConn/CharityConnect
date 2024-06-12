// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CharityPass is ERC721Enumerable, Ownable {
    using Strings for uint256;

    string public baseUri = "https://resources.smarttokenlabs.com/";

    // id attestation ID -> claimed count
    mapping(string => uint) public claimedById;

    // attestation uid -> claimed count
    mapping(bytes32 => uint) public claimedByUid;

    uint public claimed;

    uint public totalClaimable;

    address private _minter;

    uint256 private _nextTokenId = 0;

    constructor(string memory name, string memory symbol, uint256 _totalClaimable) Ownable(msg.sender) ERC721(name, symbol) {
        totalClaimable = _totalClaimable;
    }

    function claim(bytes32 uid, string calldata id, address to) public {
        require(_msgSender() == owner() || _msgSender() == _minter, "Not allow to mint");
        require(1 + claimed <= totalClaimable, "No more pass to claim");
        require(claimedById[id] == 0, "Already claimed");

        claimedById[id] += 1;
        claimedByUid[uid] += 1;
        claimed += 1;

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

    function setMinter(address minter) external onlyOwner {
        _minter = minter;
    }

    function setTotalClaimable(uint256 _totalClaimable) public onlyOwner {
        totalClaimable = _totalClaimable;
    }

    function resetClaimed() public onlyOwner {
        claimed = 0;
    }

    function resetClaimedById(string calldata id) public onlyOwner {
        claimedById[id] = 0;
    }

    function _contractAddress() internal view returns (string memory) {
        return Strings.toHexString(uint160(address(this)), 20);
    }
}
