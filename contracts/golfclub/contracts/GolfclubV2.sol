// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "./ERC721PresetMinterPauserAutoIdUpgradeableMod.sol";
import {NativeMetaTransaction} from "./NativeMetaTransaction.sol";
import {ContextMixin} from "./ContextMixin.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "./ERC2981ContractWideRoyalties.sol";
//import "hardhat/console.sol";

/**
 * @dev {ERC721} token, including:
 *
 *  - ability for holders to burn (destroy) their tokens
 *  - a minter role that allows for token minting (creation)
 *  - a pauser role that allows to stop all token transfers
 *  - token ID and URI autogeneration
 *
 * This contract uses {AccessControl} to lock permissioned functions using the
 * different roles - head to its documentation for details.
 *
 * The account that deploys the contract will be granted the minter and pauser
 * roles, as well as the default admin role, which will let it grant both minter
 * and pauser roles to other accounts.
 */
contract GolfclubV2 is
    ERC2981ContractWideRoyalties,
    ERC721PresetMinterPauserAutoIdUpgradeable,
    NativeMetaTransaction,
    ContextMixin
{
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using StringsUpgradeable for uint256;
    using StringsUpgradeable for uint16;

    string private _contractURI;
    mapping (uint256 => string) private _nftName;
    mapping (uint256 => address) private _players;
    mapping (uint256 => uint16) private _golfclubIds;
    mapping (uint16 => uint16) private _maxSupply;
    mapping (uint16 => CountersUpgradeable.Counter)  internal _golfclubSupply;
    mapping (uint256 => mapping (uint16 => uint16)) private _nftProperty;
    bool private _eip712Initialized;

    function issue(address to, uint16 golfclubId) public returns(uint256) {
        require(hasRole(MINTER_ROLE, _msgSender()), "Golfclub: must have minter role to issue new golfclub");
        require(getGolfclubSupply(golfclubId) < getMaxSupply(golfclubId), "Reached max supply");

        uint256 tokenId = _tokenIdTracker.current();

        mint(to);
        _golfclubSupply[golfclubId].increment();
        _golfclubIds[tokenId] = golfclubId;

        emit Issued(tokenId, to);

        return tokenId;
    }

    function getGolfclubSupply(uint16 golfclubId) public view returns(uint16) {
        return uint16(_golfclubSupply[golfclubId].current());
    }

    function setMaxSupply(uint16 golfclubId, uint16 maxSupply) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "Golfclub: must have admin role");
        _maxSupply[golfclubId] = maxSupply;
    }

    function getMaxSupply(uint16 golfclubId) public view returns(uint16){
        return _maxSupply[golfclubId];
    }

    function getGolfclubId(uint256 tokenId) public view returns(uint16) {
        return _golfclubIds[tokenId];
    }

    function getPlayer(uint256 tokenId) public view returns(address) {
        return _players[tokenId];
    }

    function setPlayerInternal(uint256 tokenId, address player) internal {
        address old = _players[tokenId];
        _players[tokenId] = player;

        emit PlayerSet(tokenId, player, old);
    }

    function setPlayer(uint256 tokenId, address player) public {
        require(ownerOf(tokenId) == _msgSender());

        setPlayerInternal(tokenId, player);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId);

        setPlayerInternal(tokenId, to);
    }

    /**
    * @dev Get the URL to a JSON file with contract metadata for OpenSea.
    */
    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    /**
    * @dev Set the URL to a JSON file with contract metadata for OpenSea.
    * @param __contractURI - an URL to the metadata
    */
    function setContractURI(string memory __contractURI) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "Golfclub: must have admin role to change contract uri");

        _contractURI = __contractURI;

        emit ContractURISet(__contractURI);
    }

    function setBaseURI(string memory baseURI) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "Golfclub: must have admin role to change base token uri");

        _baseTokenURI = baseURI;
    }

     /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string(
                 abi.encodePacked(
                    abi.encodePacked(baseURI, _golfclubIds[tokenId].toString()),
                    abi.encodePacked("/",tokenId.toString())
                 )
            ) : "";
    }

    function setName(uint256 id, string memory name) public {
        bool is_owner = ownerOf(id) == _msgSender();
        require(is_owner, "Golfclub: must be the owner of the token to set name");

        _nftName[id] = name;

        emit NameSet(id, name);
    }


    function getName(uint256 id) public view returns (string memory) {
        return _nftName[id];
    }


    function setProperty(uint256 tokenId, uint16 propertyId, uint16 value) public {
        require(propertyId != 0, "Property 0 is reserved for golfclubId");
        require(hasRole(MINTER_ROLE, _msgSender()), "Golfclub: must have minter role to set property");

        _nftProperty[tokenId][propertyId] = value;

        emit PropertySet(tokenId, propertyId, value);
    }


    function getProperty(uint256 tokenId, uint16 propertyId) public view returns (uint16) {

        return _nftProperty[tokenId][propertyId];
    }

    function setRoyalties(address recipient, uint256 value) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "admin");
        _setRoyalties(recipient, value);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC2981ContractWideRoyalties, ERC721PresetMinterPauserAutoIdUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    /* EVENTS */

    /**
    * @dev Emits when the contract URI is set
    * @param contractURI - an URL to the metadata
    */
    event ContractURISet(string contractURI);

    /**
    * @dev Emits when the owner names the token
    * @param id - Id of the ERC721 token
    * @param name - Name of the token
    */
    event NameSet(uint256 id, string name);

    /**
    * @param tokenId - Id of the ERC721 token
    * @param propertyId - Id of the property
    * @param value - Value of the property
    */
    event PropertySet(uint256 tokenId, uint16 propertyId, uint16 value);

    event PlayerSet(uint256 tokenId, address newPlayer, address oldPlayer);

    event Issued(uint256 tokenId, address owner);
    // This is to support Native meta transactions
    // never use msg.sender directly, use _msgSender() instead


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

    function initializeEIP712() public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "admin");
        require(_eip712Initialized == false, "already initialized");
        super._setDomainSeperator(super.name());
        _eip712Initialized = true;
    }

}
