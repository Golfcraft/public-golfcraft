//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Wearable {
    uint count;

    function issueTokens(address[] calldata _beneficiaries, uint256[] calldata _itemIds) public {
        count = count +1;
    }
}
