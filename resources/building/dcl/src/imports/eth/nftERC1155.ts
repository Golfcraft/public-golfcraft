import { getUserAccount } from '@decentraland/EthereumController'
import * as eth from 'eth-connect'
import { getContract } from "./eth"

import { ERC1155_ABI } from './abi/erc1155'
import { Erc1155 } from './contracts/erc1155'

/**
 * Returns true if the player owns at least one of the listed tokens from the indicated contract
 *
 * @param contractAddress ERC721 smartcontract address
 * @param tokenIds One or multiple token IDs to check player ownership
 */
export async function checkTokens(address: string, contractAddress: eth.Address, tokenIds?: number | number[]): Promise<boolean> {
  log("checkTokens!")
  const contract = (await getContract(contractAddress, ERC1155_ABI)).contract as Erc1155

    let length
    if (typeof tokenIds === 'number') {
        length = 1
        tokenIds = [tokenIds]
    } else if (typeof tokenIds === 'string') {
        length = 1
        tokenIds = [tokenIds]
    }
    length = tokenIds.length
    log("length", length)

    let res = false
    for (let i = 0; i < length; i++) {
      log("for", i)
      log("balanceOf", address, tokenIds[i])

      let balance = Number(await contract.balanceOf(address, tokenIds[i]))
      log("balance", balance)
      if (typeof tokenIds === 'number') {
        if (balance > 0) {
          res = true
          break
        }
      } else {
        for (let j = 0; j < tokenIds.length; j++) {
          if (balance > 0) {
            res = true
            break
          }
        }
      }
    }
    return res
}
