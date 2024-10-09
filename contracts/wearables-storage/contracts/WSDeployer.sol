//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./WearablesStorage.sol";

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";

import "./EIP712MetaTransaction.sol";

import "./wearable.sol";

contract WSDeployer is ERC721Holder, AccessControlEnumerable, EIP712MetaTransaction("Golfcraft Deployer","3") {

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor() {
        console.log("Deploying a WSDeployer");

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());

    }

    function deployWearablesStorage(string memory _collectionName) public returns (address) {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "WSDeployer: Sender should be admin");

        WearablesStorage newc = new WearablesStorage(_collectionName, _msgSender());

        emit ContractCreated(address(newc));

        return address(newc);
    }

    // Turn deployer into storage

    function setApprovalForAll(address _contract, address operator, bool approved) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "WSDeployer: Sender should be admin");

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
        require(hasRole(MINTER_ROLE, _msgSender()), "WSDeployer: Sender should be minter");

        address my_address = address(this);

        _sendNFT(_contract, my_address, to);
    }

    function sendNFTFrom(address _contract, address from, address to) public {
        require(hasRole(MINTER_ROLE, _msgSender()), "WSDeployer: Sender should be minter");

        _sendNFT(_contract, from, to);
    }

    // Add relayer as a workaround for
    // lack of metatransactions on old storage contracts

    function relaySendNFT(address _storage, address _contract, address to) public {
        require(hasRole(MINTER_ROLE, _msgSender()), "WSDeployer: Sender should be minter");

        WearablesStorage storageContract = WearablesStorage(_storage);

        storageContract.sendNFT(_contract, to);
    }

    /*
    function relaySendNFTFrom(address _storage, address _contract, address from, address to) public {
        require(hasRole(MINTER_ROLE, _msgSender()), "WSDeployer: Sender should be minter");

        WearablesStorage storageContract = WearablesStorage(_storage);

        storageContract.sendNFTFrom(_contract, from, to);
    }
    */

    function relayIssueTokens(address _wearable, address[] calldata _beneficiaries, uint256[] calldata _itemIds) public {
        require(hasRole(MINTER_ROLE, _msgSender()), "WSDeployer: Sender should be minter");

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

    event ContractCreated(address newAddress);
}
