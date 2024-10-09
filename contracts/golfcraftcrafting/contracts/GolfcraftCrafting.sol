// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/presets/ERC1155PresetMinterPauserUpgradeable.sol";
import {NativeMetaTransaction} from "./NativeMetaTransaction.sol";
import {ContextMixin} from "./ContextMixin.sol";

contract GolfcraftCrafting is
    Initializable,
    //ContextUpgradeable,
    AccessControlEnumerableUpgradeable,
    NativeMetaTransaction,
    ContextMixin
{

    function initialize(string memory domainSeparator, address elementsERC1155, address partsERC1155) public {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(PAUSER_ROLE, _msgSender());
        _setupRole(CHEF_ROLE, _msgSender());

        _initializeEIP712(domainSeparator);
        name = domainSeparator;
        paused = false;

        setERC1155(elementsERC1155, partsERC1155);
    }

    mapping (uint256 => uint256[]) private _recipes_ids;
    mapping (uint256 => uint256[]) private _recipes_amounts;
    mapping (uint256 => bool) private _recipes_active;

    ERC1155PresetMinterPauserUpgradeable public _elementsERC1155;
    ERC1155PresetMinterPauserUpgradeable public _partsERC1155;

    string public name;

    bool public paused;

    bytes32 public constant CHEF_ROLE = keccak256("CHEF_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /**
    * @dev Set the ERC1155 contract for the elements and parts.
    * @param elementsERC1155 The ERC1155 contract for the elements.
    * @param partsERC1155 The ERC1155 contract for the parts.
    */
    function setERC1155(address elementsERC1155, address partsERC1155) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "GolfcraftCrafting: must have admin role to set ERC1155");

        _elementsERC1155 = ERC1155PresetMinterPauserUpgradeable(elementsERC1155);
        _partsERC1155 = ERC1155PresetMinterPauserUpgradeable(partsERC1155);

        emit erc1155Set(_msgSender(), elementsERC1155, partsERC1155);
    }

    /**
    * @dev Add a new recipe to the list of recipes.
    * @param _partId The id of the part to be crafted.
    * @param elementIds The ids of the elements used to craft the part.
    * @param elementAmounts The amounts of the elements used to craft the part.
    */
    function addRecipe(uint16 _partId, uint[] memory elementIds, uint[] memory elementAmounts) public {
        require(hasRole(CHEF_ROLE, _msgSender()), "GolfcraftCrafting: must have chef role to add recipe");
        require(elementIds.length == elementAmounts.length, "GolfcraftCrafting: array lengths must match");

        _recipes_amounts[_partId] = elementAmounts;
        _recipes_ids[_partId] = elementIds;
        _recipes_active[_partId] = true;

        emit recipeAdded(_msgSender(), _partId, elementIds, elementAmounts);
    }

    /**
    * @dev Allows an admin to deactivate a recipe.
    * @param _partId The id of the recipe to deactivate.
    */
    function removeRecipe(uint16 _partId) public {
        require(hasRole(CHEF_ROLE, _msgSender()), "GolfcraftCrafting: must have chef role to remove recipe");

        _recipes_active[_partId] = false;

        emit recipeRemoved(_msgSender(), _partId);
    }

    /**
    * @dev Crafts a new part.
    * @param _partId The id of the part to be crafted.
    * @param _amount The amount of copies of the part to be crafted.
    */
    function craftPart(uint256 _partId, uint16 _amount) external {
        require(_recipes_active[_partId], "GolfcraftCrafting: part recipe not active");
        require(_amount > 0, "GolfcraftCrafting: amount must be > 0");
        require(!paused, "GolfcraftCrafting: contract is paused");

        for (uint16 n = 0; n < _amount; n++) {
            _elementsERC1155.burnBatch(_msgSender(), _recipes_ids[_partId], _recipes_amounts[_partId]);
        }

        _partsERC1155.mint(_msgSender(), _partId, _amount, "");

        emit partCrafted(_msgSender(), _partId, _amount);
    }

    /**
    * @dev Given a part ID, returns the list of elements and list with the amount of each element required to craft it.
    * @param _partId The id of the part to be crafted.
    */
    function getRecipe(uint16 _partId) public view returns (uint[] memory elementIds, uint[] memory elementAmounts, bool isActive) {

        elementIds = _recipes_ids[_partId];
        elementAmounts = _recipes_amounts[_partId];
        isActive = _recipes_active[_partId];
        return (elementIds, elementAmounts, isActive);
    }


    /**
    * @dev Pauses the contract.
    */
    function pause(bool _paused) public {
        require(hasRole(PAUSER_ROLE, _msgSender()), "GolfcraftCrafting: must have pauser role to pause");
        paused = _paused;
        emit pausedChanged(_msgSender(), _paused);
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


    /**
    * @dev Emitted when a new pair of elements and parts contract addresses are set.
    * @param sender The address of the sender.
    * @param elementsERC1155 The ERC1155 contract for the elements.
    * @param partsERC1155 The ERC1155 contract for the parts.
    */
    event erc1155Set(address indexed sender, address indexed elementsERC1155, address indexed partsERC1155);

    /**
    * @dev Emitted when a new recipe is added.
    * @param sender The address of the sender.
    * @param partId The id of the part to be crafted.
    * @param elementIds The ids of the elements used to craft the part.
    * @param elementAmounts The amounts of the elements used to craft the part.
    */
    event recipeAdded(address indexed sender, uint16 indexed partId, uint[] elementIds, uint[] elementAmounts);

    /**
    * @dev Emitted when a recipe is removed.
    * @param sender The address of the sender.
    * @param partId The id of the part to be removed.
    */
    event recipeRemoved(address indexed sender, uint16 indexed partId);

    /**
    * @dev Emitted when a new part is crafted.
    * @param sender The address of the sender.
    * @param partId The id of the part that was crafted.
    * @param amount The amount of copies of the part that was crafted.
    */
    event partCrafted(address indexed sender, uint256 indexed partId, uint16 amount);

    /**
    * @dev Emitted when the paused state changes.
    * @param sender The address of the sender.
    * @param paused The new paused state.
    */
    event pausedChanged(address indexed sender, bool paused);
}
