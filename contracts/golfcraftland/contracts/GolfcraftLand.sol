// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/presets/ERC1155PresetMinterPauserUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/utils/ERC1155HolderUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import {NativeMetaTransaction} from "./NativeMetaTransaction.sol";
import {ContextMixin} from "./ContextMixin.sol";
import "./ERC2981ContractWideRoyalties.sol";

/// @custom:security-contact admin@ohmyverse.io
contract GolfcraftLand is
    Initializable,
    ERC721Upgradeable,
    ERC721EnumerableUpgradeable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    OwnableUpgradeable,
    ERC721BurnableUpgradeable,
    ERC2981ContractWideRoyalties,
    NativeMetaTransaction,
    ContextMixin,
    ERC1155HolderUpgradeable
    
    {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant REMOVER_ROLE = keccak256("REMOVER_ROLE");
    CountersUpgradeable.Counter private _tokenIdCounter;
    string private baseURI;
    string public contractURI;
    ERC1155PresetMinterPauserUpgradeable private partsContract;
    mapping(uint => mapping(uint => uint)) private landToPartToAmount;
    mapping(uint => uint) private tokenToCollectionId;
    mapping(address => mapping(address => mapping(uint => uint))) private landOwnerToLandOperatorToPartToAmount;
    mapping(uint => address) private landIdToLandOperator;
    mapping(address => address) private landOwnerToLandManager;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() initializer public {
        __ERC721_init("GolfcraftLand", "GLFLND");
        __ERC721Enumerable_init();
        __Pausable_init();
        __AccessControl_init();
        __ERC721Burnable_init();
        __Ownable_init_unchained();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);

        _initializeEIP712("GolfcraftLand");

        baseURI = "https://";
    }

    function setRoyalties(address recipient, uint256 value) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "admin");
        _setRoyalties(recipient, value);
    }

    /**
    * @dev Set the URL to a JSON file with contract metadata for OpenSea.
    * @param _contractURI - an URL to the metadata
    */
    function setContractURI(string memory _contractURI) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "GolfcraftLand: must have admin role to change contract uri");

        contractURI = _contractURI;

        emit ContractURISet(_contractURI);
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory __baseURI) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "GolfcraftLand: must have admin role to change base token uri");

        baseURI = __baseURI;

        emit BaseURISet(__baseURI);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function safeMint(address to, uint collectionId) public onlyRole(MINTER_ROLE) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setCollectionId(tokenId, collectionId);
    }

    function _setCollectionId(uint256 tokenId, uint collectionId) internal {
        tokenToCollectionId[tokenId] = collectionId;
    }

    function safeMintBatch(address to, uint collectionId, uint256 count) public onlyRole(MINTER_ROLE) {
        for(uint256 i = 0; i < count; i++) {
            safeMint(to, collectionId);
        }
    }

    /**
    * @dev Set ERC1155 parts contract.
    * @param _partsContract - an address to the ERC1155 parts contract
    */
    function setPartsContract(address _partsContract) public onlyRole(DEFAULT_ADMIN_ROLE) {

        partsContract = ERC1155PresetMinterPauserUpgradeable(_partsContract);
        emit PartsContractSet(_partsContract);
    }

    /**
    * @dev get collection id for a token
    * @param tokenId - token id
    */
    function getCollectionId(uint256 tokenId) public view returns (uint) {
        return tokenToCollectionId[tokenId];
    }

    /**
    * @dev Move parts to land.
    * @param landId - the land to move parts to
    * @param partIds - the array of parts to move
    * @param amounts - the array of amounts of parts to move
    */
    function movePartsToLand(uint256 landId, uint256[] memory partIds, uint256[] memory amounts) public {
        require(!super.paused(), "GolfcraftLand: paused");
        require(super.ownerOf(landId) == _msgSender() ||
            landOwnerToLandManager[super.ownerOf(landId)] == _msgSender() ||
            landIdToLandOperator[landId] == _msgSender(), "GolfcraftLand: caller must be land owner, land operator or manager");

        partsContract.safeBatchTransferFrom(_msgSender(), address(this), partIds, amounts, "");
        for(uint256 i = 0; i < partIds.length; i++) {
            landToPartToAmount[landId][partIds[i]] += amounts[i];
        }

        emit PartsMovedToLand(landId, partIds, amounts);
    }

    /**
    * @dev Move parts from land.
    * @param to - the address to move parts to
    * @param landId - the land to move parts from
    * @param partIds - the array of parts to move
    * @param amounts - the array of amounts of parts to move
    */
    function movePartsFromLand(address to, uint256 landId, uint256[] memory partIds, uint256[] memory amounts) public {
        require(!super.paused(), "GolfcraftLand: paused");
        require(hasRole(REMOVER_ROLE, _msgSender()), "GolfcraftLand: must have REMOVER_ROLE role");
        for(uint256 i = 0; i < partIds.length; i++) {
            uint256 partId = partIds[i];
            uint256 amount = amounts[i];
            uint256 partAmount = landToPartToAmount[landId][partId];
            require(partAmount >= amount, "GolfcraftLand: part amount is less than requested amount");
            landToPartToAmount[landId][partId] -= amount;
        }
        partsContract.safeBatchTransferFrom(address(this), to, partIds, amounts, "");

        emit PartsMovedFromLand(landId, partIds, amounts);
    }

    /**
    * @dev Get the amount of parts on a land.
    * @param landId - the land to get the amount of parts from
    * @param partId - the part to get the amount of
    */
    function getPartAmount(uint256 landId, uint256 partId) public view returns (uint256) {
        return landToPartToAmount[landId][partId];
    }

    // Managers and Operators

    /**
    * @dev Set manager for an account.
    * @param landManager - the land manager to set
    */
    function setLandManager(address landManager) public {
        _setLandManager(landManager);
    }

    /**
    * @dev Set manager for an account. (private function)
    * @param landManager - the land manager to set
    */
    function _setLandManager(address landManager) internal {
        landOwnerToLandManager[_msgSender()] = landManager;

        emit LandManagerSet(_msgSender(), landManager);
    }

    /**
    * @dev Get manager for an account.
    * @param landOwner - the land owner to get the manager for
    */
    function getLandManager(address landOwner) public view returns (address) {
        return landOwnerToLandManager[landOwner];
    }

    /**
    * @dev Remove manager for an account.
    */
    function removeLandManager() public {
        _setLandManager(address(0));
    }

    /**
    * @dev Set operator for a land. (only land owner can set it, public function)
    * @param landId - the land to set the operator for
    * @param operator - the operator to set
    */
    function setLandOperator(uint256 landId, address operator) public {
        require(super.ownerOf(landId) == _msgSender(), "GolfcraftLand: not land owner");
        _setLandOperator(landId, operator);
    }

    /**
    * @dev Set operator for a land. (private function)
    * @param landId - the land to set the operator for
    * @param operator - the operator to set
    */
    function _setLandOperator(uint256 landId, address operator) private {
        landIdToLandOperator[landId] = operator;

        emit LandOperatorSet(landId, operator);
    }

    /**
    * @dev Get operator for a land.
    * @param landId - the land to get the operator for
    */
    function getLandOperator(uint256 landId) public view returns (address) {
        return landIdToLandOperator[landId];
    }

    /**
    * @dev Remove operator for a land. (only land owner can remove it)
    * @param landId - the land to remove the operator for
    */
    function removeLandOperator(uint256 landId) public {
        require(super.ownerOf(landId) == _msgSender(), "GolfcraftLand: not land owner");
        _setLandOperator(landId, address(0));
    }

    // Part storage

    /**
    * @dev Store a batch of part for a specific address.
    * @param operatorOrManager - the operator or manager address to store the parts for
    * @param partIds - the array of part ids to store
    * @param amounts - the array of amounts of parts to store
    */
    function storeParts(address operatorOrManager, uint256[] memory partIds, uint256[] memory amounts) public {
        require(!super.paused(), "GolfcraftLand: paused");
        partsContract.safeBatchTransferFrom(_msgSender(), address(this), partIds, amounts, "");
        // Save info on mapping landOwnerToLandOperatorToPartToAmount
        for(uint256 i = 0; i < partIds.length; i++) {
            uint256 partId = partIds[i];
            uint256 amount = amounts[i];
            landOwnerToLandOperatorToPartToAmount[_msgSender()][operatorOrManager][partId] += amount;
        }

        emit PartsStored(_msgSender(), operatorOrManager, partIds, amounts);
    }

    /**
    * @dev Get the amount of parts stored for a specific address.
    * @param operatorOrManager - the operator or manager address to get the amount of parts for
    * @param partId - the part id to get the amount of
    */
    function getPartAmountStored(address operatorOrManager, uint256 partId) public view returns (uint256) {
        return landOwnerToLandOperatorToPartToAmount[_msgSender()][operatorOrManager][partId];
    }

    /**
    * @dev Unstore a batch of parts fro a specific address.
    * @param operatorOrManager - the operator or manager address to unstore the parts for
    * @param partIds - the array of part ids to unstore
    * @param amounts - the array of amounts of parts to unstore
    */
    function unstoreParts(address operatorOrManager, uint256[] memory partIds, uint256[] memory amounts) public {
        require(!super.paused(), "GolfcraftLand: paused");
        for(uint256 i = 0; i < partIds.length; i++) {
            uint256 partId = partIds[i];
            uint256 amount = amounts[i];
            uint256 partAmount = landOwnerToLandOperatorToPartToAmount[_msgSender()][operatorOrManager][partId];
            require(partAmount >= amount, "GolfcraftLand: part amount is less than requested amount");
            landOwnerToLandOperatorToPartToAmount[_msgSender()][operatorOrManager][partId] -= amount;
        }
        partsContract.safeBatchTransferFrom(address(this), _msgSender(), partIds, amounts, "");

        emit PartsUnstored(_msgSender(), operatorOrManager, partIds, amounts);
    }

    /**
    * @dev Send parts from storage to land
    * @param landId - the land to send the parts to
    * @param partIds - the array of part ids to send
    * @param amounts - the array of amounts of parts to send
    */
    function unstorePartsToLand(uint256 landId, uint256[] memory partIds, uint256[] memory amounts) public {
        require(!super.paused(), "GolfcraftLand: paused");
        require(super.ownerOf(landId) == _msgSender() ||
            landOwnerToLandManager[super.ownerOf(landId)] == _msgSender() ||
            landIdToLandOperator[landId] == _msgSender(), "GolfcraftLand: caller must be land owner, land operator or manager");
        for(uint256 i = 0; i < partIds.length; i++) {
            uint256 partId = partIds[i];
            uint256 amount = amounts[i];
            uint256 partAmount = landOwnerToLandOperatorToPartToAmount[super.ownerOf(landId)][_msgSender()][partId];
            require(partAmount >= amount, "GolfcraftLand: part amount is less than requested amount");
            landOwnerToLandOperatorToPartToAmount[super.ownerOf(landId)][_msgSender()][partId] -= amount;
            landToPartToAmount[landId][partId] += amount;
        }

        emit PartsUnstoredToLand(super.ownerOf(landId), _msgSender(), landId, partIds, amounts);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        whenNotPaused
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
    {
        // Remove operator from tokenId
        _setLandOperator(tokenId, address(0));
        super._beforeTokenTransfer(from, to, tokenId);
    }

    // The following functions are overrides required by Solidity.

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable, AccessControlUpgradeable, ERC2981ContractWideRoyalties, ERC1155ReceiverUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
    * @dev Emits when the contract URI is set
    * @param contractURI - an URL to the metadata
    */
    event ContractURISet(string contractURI);

    /**
    * @dev Emits when parts are moved to land
    * @param landId - the land to move parts to
    * @param partIds - the array of parts to move
    * @param amounts - the array of amounts of parts to move
    */
    event PartsMovedToLand(uint256 landId, uint256[] partIds, uint256[] amounts);

    /**
    * @dev Emits when parts are moved from land
    * @param landId - the land to move parts from
    * @param partIds - the array of parts to move
    * @param amounts - the array of amounts of parts to move
    */
    event PartsMovedFromLand(uint256 landId, uint256[] partIds, uint256[] amounts);

    /**
    * @dev Emits when the base URI is set
    * @param baseURI - an URL to the base token metadata
    */
    event BaseURISet(string baseURI);

    /**
    * @dev Emits when the parts contract is set
    * @param partsContract - an address to the ERC1155 parts contract
    */
    event PartsContractSet(address partsContract);

    /**
    * @dev Emits when the parts are stored
    * @param owner - the owner address to store the parts for
    * @param operatorOrManager - the operator or manager address to store the parts for
    * @param partIds - the array of part ids to store
    * @param amounts - the array of amounts of parts to store
    */
    event PartsStored(address owner, address operatorOrManager, uint256[] partIds, uint256[] amounts);

    /**
    * @dev Emits when the parts are unstored
    * @param owner - the owner address to unstore the parts for
    * @param operatorOrManager - the operator or manager address to unstore the parts for
    * @param partIds - the array of part ids to unstore
    * @param amounts - the array of amounts of parts to unstore
    */
    event PartsUnstored(address owner, address operatorOrManager, uint256[] partIds, uint256[] amounts);

    /**
    * @dev Emits when the parts are sent to land
    * @param owner - the owner address for the land to send parts to
    * @param operatorOrManager - the operator or manager address to unstore the parts for
    * @param landId - the land to send the parts to
    * @param partIds - the array of part ids to send
    * @param amounts - the array of amounts of parts to send
    */
    event PartsUnstoredToLand(address owner, address operatorOrManager, uint256 landId, uint256[] partIds, uint256[] amounts);

    /**
    * @dev Emits when the land manager is set
    * @param owner - the owner address setting the manager
    * @param landManager - an address to the land manager
    */
    event LandManagerSet(address owner, address landManager);

    /**
    * @dev Emits when the land operator is set
    * @param landId - the land to set the operator for
    * @param landOperator - an address to the land operator
    */
    event LandOperatorSet(uint256 landId, address landOperator);

    // This is to support Native meta transactions
    // never use msg.sender directly, use _msgSender() instead
    function _msgSender()
        internal
        override
        view
        returns (address sender) // Eibriel removed "payable"
    {
            return ContextMixin.msgSender();
    }
}
