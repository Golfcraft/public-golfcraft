// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.5.0) (token/ERC1155/presets/ERC1155PresetMinterPauser.sol)

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import {NativeMetaTransaction} from "./NativeMetaTransaction.sol";
import {ContextMixin} from "./ContextMixin.sol";
import "./ERC2981ContractWideRoyalties.sol";

/**
 * @dev {ERC1155} token, including:
 *
 *  - ability for holders to burn (destroy) their tokens
 *  - a minter role that allows for token minting (creation)
 *  - a pauser role that allows to stop all token transfers
 *
 * This contract uses {AccessControl} to lock permissioned functions using the
 * different roles - head to its documentation for details.
 *
 * The account that deploys the contract will be granted the minter and pauser
 * roles, as well as the default admin role, which will let it grant both minter
 * and pauser roles to other accounts.
 *
 * _Deprecated in favor of https://wizard.openzeppelin.com/[Contracts Wizard]._
 */
contract GolfcraftParts is
    Initializable,
    ContextUpgradeable,
    AccessControlEnumerableUpgradeable,
    OwnableUpgradeable,
    ERC1155BurnableUpgradeable,
    ERC1155PausableUpgradeable,

    // Classes added
    ERC1155SupplyUpgradeable,
    ERC2981ContractWideRoyalties,
    NativeMetaTransaction,
    ContextMixin
{
    function initialize(string memory uri, string memory _name, string memory _symbol, string memory _contractURI) public virtual initializer {
        __ERC1155PresetMinterPauser_init(uri, _name, _symbol, _contractURI);
    }
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Variables added
    string public contractURI;
    string public name;
    string public symbol;
    bool private _eip712Initialized;


    /**
     * @dev Grants `DEFAULT_ADMIN_ROLE`, `MINTER_ROLE`, and `PAUSER_ROLE` to the account that
     * deploys the contract.
     */
    function __ERC1155PresetMinterPauser_init(string memory uri, string memory _name, string memory _symbol, string memory _contractURI) internal onlyInitializing {
        __ERC1155_init_unchained(uri);
        __Pausable_init_unchained();
        __ERC1155PresetMinterPauser_init_unchained(uri);
        __ERC1155Supply_init_unchained();
        __Ownable_init_unchained();

        initializeEIP712(_name);
        name = _name;
        symbol = _symbol;
        setContractURI(_contractURI);
    }

    function __ERC1155PresetMinterPauser_init_unchained(string memory) internal onlyInitializing {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());

        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(PAUSER_ROLE, _msgSender());
    }

    /**
     * @dev Creates `amount` new tokens for `to`, of token type `id`.
     *
     * See {ERC1155-_mint}.
     *
     * Requirements:
     *
     * - the caller must have the `MINTER_ROLE`.
     */
    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public virtual {
        require(hasRole(MINTER_ROLE, _msgSender()), "ERC1155PresetMinterPauser: must have minter role to mint");

        _mint(to, id, amount, data);
    }

    /**
     * @dev xref:ROOT:erc1155.adoc#batch-operations[Batched] variant of {mint}.
     */
    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public virtual {
        require(hasRole(MINTER_ROLE, _msgSender()), "ERC1155PresetMinterPauser: must have minter role to mint");

        _mintBatch(to, ids, amounts, data);
    }

    /**
     * @dev Pauses all token transfers.
     *
     * See {ERC1155Pausable} and {Pausable-_pause}.
     *
     * Requirements:
     *
     * - the caller must have the `PAUSER_ROLE`.
     */
    function pause() public virtual {
        require(hasRole(PAUSER_ROLE, _msgSender()), "ERC1155PresetMinterPauser: must have pauser role to pause");
        _pause();
    }

    /**
     * @dev Unpauses all token transfers.
     *
     * See {ERC1155Pausable} and {Pausable-_unpause}.
     *
     * Requirements:
     *
     * - the caller must have the `PAUSER_ROLE`.
     */
    function unpause() public virtual {
        require(hasRole(PAUSER_ROLE, _msgSender()), "ERC1155PresetMinterPauser: must have pauser role to unpause");
        _unpause();
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlEnumerableUpgradeable, ERC1155Upgradeable, ERC2981ContractWideRoyalties)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override(ERC1155Upgradeable, ERC1155PausableUpgradeable, ERC1155SupplyUpgradeable) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }


    /**
    * Code added
    */

    function setRoyalties(address recipient, uint256 value) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "admin");
        _setRoyalties(recipient, value);
    }

    /**
    * @dev Set the URL to a JSON file with contract metadata for OpenSea.
    * @param _contractURI - an URL to the metadata
    */
    function setContractURI(string memory _contractURI) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "GolfcraftParts: must have admin role to change contract uri");

        contractURI = _contractURI;

        emit ContractURISet(_contractURI);
    }

    function setBaseURI(string memory baseURI) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "GolfcraftParts: must have admin role to change base token uri");

        _setURI(baseURI);
    }

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

    function initializeEIP712(string memory _name) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "admin");
        require(_eip712Initialized == false, "already initialized");
        super._setDomainSeperator(_name);
        _eip712Initialized = true;
    }

    /**
    * @dev Emits when the contract URI is set
    * @param contractURI - an URL to the metadata
    */
    event ContractURISet(string contractURI);



    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[50] private __gap;
}
