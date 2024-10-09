import { getProvider } from '@decentraland/web3-provider'
import * as eth from 'eth-connect'

export enum ErcType {
  erc20 = 0,
  erc721 = 1,
  erc1155 = 2
}

export type TokenInfo = {
  contract: string,
  ercType: ErcType,
  net?: number,
  token_ids?: number[]
}

/**
 * Return Contract, Provider and RequestManager
 *
 * @param contractAddress Smartcontract ETH address
 */
 export async function getContract(contractAddress: eth.Address, abi: any) {
    const provider = await getProvider()
    const requestManager = new eth.RequestManager(provider)
    const factory = new eth.ContractFactory(requestManager, abi)
    const contract = (await factory.at(contractAddress)) as any
    return { contract, provider, requestManager }
  }