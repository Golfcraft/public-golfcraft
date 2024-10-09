//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";

import "./EIP712MetaTransaction.sol";

import "./wearable.sol";

contract WearablesStorage is ERC721Holder, AccessControlEnumerable, EIP712MetaTransaction("Golfcraft Storage","3") {

    string public collectionName;

    constructor(string memory _collectionName, address admin) {
        _setupRole(DEFAULT_ADMIN_ROLE, admin);

        collectionName = _collectionName;
    }

    function setCollectionName(string memory _collectionName) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "WearablesStorage: Sender should be admin");

        collectionName = _collectionName;
    }

    function setApprovalForAll(address _contract, address operator, bool approved) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "WearablesStorage: Sender should be admin");

        ERC721PresetMinterPauserAutoId collectionContract = ERC721PresetMinterPauserAutoId(_contract);

        collectionContract.setApprovalForAll(operator, approved);
    }

    function _sendNFT(address _contract, address from, address to) private {

        ERC721PresetMinterPauserAutoId collectionContract = ERC721PresetMinterPauserAutoId(_contract);

        uint256 tokenId = collectionContract.tokenOfOwnerByIndex(from, 0);

        console.log("tokenID to send: ", tokenId);
        console.log("from: ", from);
        console.log("to: ", to);

        collectionContract.safeTransferFrom(from, to, tokenId);
    }

    function sendNFT(address _contract, address to) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "WearablesStorage: Sender should be admin");

        address my_address = address(this);

        _sendNFT(_contract, my_address, to);
    }

    function sendNFTFrom(address _contract, address from, address to) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "WearablesStorage: Sender should be admin");

        _sendNFT(_contract, from, to);
    }

    function relayIssueTokens(address _wearable, address[] calldata _beneficiaries, uint256[] calldata _itemIds) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "WearablesStorage: Sender should be admin");

        Wearable wearableContract = Wearable(_wearable);

        wearableContract.issueTokens(_beneficiaries, _itemIds);
    }

    function _msgSender()
        internal
        override
        view
        returns (address sender) // Eibriel removed "payable"
    {
            return msgSender();
    }
}
