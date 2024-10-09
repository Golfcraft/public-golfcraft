// Warning this is actually a modified ERC721 type
// Its not a complete erc1155 type!!

import * as eth from 'eth-connect'

interface EventOptions {
  filter?: object
  fromBlock?: any
  topics?: string[]
}

export class Erc1155 extends eth.Contract {
  constructor(jsonInterface: any[], address?: string, options?: any)
  clone(): Erc1155
  supportsInterface(interfaceId: string | number[]): any

  safeBatchTransferFrom(
    _from: string,
    _to: string,
    _tokenIds: (number | string)[],
    options?: any
  ): any

  name(): any

  getApproved(tokenId: number | string): any

  approve(
    to: string,
    tokenId: number | string,
    options?: any
  ): any

  issueTokens(
    _beneficiaries: string[],
    _wearableIds: (string | number[])[],
    options?: any
  ): any

  totalSupply(): any

  transferFrom(
    from: string,
    to: string,
    tokenId: number | string,
    options?: any
  ): any

  tokenOfOwnerByIndex(
    owner: string,
    index: number | string
  ): any

  addWearable(
    _wearableId: string,
    _maxIssuance: number | string,
    options?: any
  ): any

  addWearables(
    _wearableIds: (string | number[])[],
    _maxIssuances: (number | string)[],
    options?: any
  ): any

  safeTransferFrom(
    from: string,
    to: string,
    tokenId: number | string,
    options?: any
  ): any

  setAllowed(
    _operator: string,
    _allowed: boolean,
    options?: any
  ): any

  tokenByIndex(index: number | string): any

  setBaseURI(
    _baseURI: string,
    options?: any
  ): any

  issueToken(
    _beneficiary: string,
    _wearableId: string,
    options?: any
  ): any

  ownerOf(tokenId: number | string): any

  baseURI(): any

  //balanceOf(owner: string): any
  // Hack for ERC1155
  balanceOf(
    owner: string,
    index: number | string
  ): any
  // End hack

  renounceOwnership(options?: any): any

  getWearableKey(_wearableId: string): any

  owner(): any

  isOwner(): any

  symbol(): any

  setApprovalForAll(
    to: string,
    approved: boolean,
    options?: any
  ): any

  isComplete(): any

  wearables(arg0: number | string): any

  issued(arg0: string | number[]): any

  tokenURI(_tokenId: number | string): any

  allowed(arg0: string): any

  wearablesCount(): any

  maxIssuance(arg0: string | number[]): any

  isApprovedForAll(owner: string, operator: string): any

  transferOwnership(
    newOwner: string,
    options?: any
  ): any

  batchTransferFrom(
    _from: string,
    _to: string,
    _tokenIds: (number | string)[],
    options?: any
  ): any

  completeCollection(options?: any): any
}
