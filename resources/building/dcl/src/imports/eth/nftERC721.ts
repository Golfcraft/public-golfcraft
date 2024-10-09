import { getUserAccount } from '@decentraland/EthereumController'
import * as eth from 'eth-connect'
import { getContract } from "./eth"

import { ERC721_ABI } from './abi/erc721'
import { Erc721 } from './contracts/erc721'




/**
 * Returns true if the player owns at least one of the listed tokens from the indicated contract
 *
 * @param contractAddress ERC721 smartcontract address
 * @param tokenIds One or multiple token IDs to check player ownership
 */
export async function checkTokens(address: string, contractAddress: eth.Address, tokenIds?: number | number[]): Promise<boolean> {
  const contract = (await getContract(contractAddress, ERC721_ABI)).contract as Erc721

  let balance = await contract.balanceOf(address)

  if (Number(balance) == 0) {
    return false
  }
  
  if (!tokenIds) {
    return true
  }

  let res = false
  if (typeof tokenIds === 'number') {
    tokenIds = [tokenIds]
  } 
  
  for (let i = 0; i < tokenIds.length; i++) {
    if(address.toLowerCase() == String(await contract.ownerOf(tokenIds[i])).toLowerCase()){
      return true
    }
  }
  return false
  
}
