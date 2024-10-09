import * as nftERC721 from './nftERC721'
import * as nftERC1155 from './nftERC1155'
import { TokenInfo } from "./eth"
//import { getUserAccount } from '@decentraland/EthereumController'

export async function hasTokenInList(address: string, tokenArray: TokenInfo[]) {
  var erc: (typeof nftERC721) | (typeof nftERC1155) = null
  for (let index = 0; index < tokenArray.length; index++) {
    switch (tokenArray[index].ercType) {
      case 1:
        erc = nftERC721
        break;
      case 2:
        erc = nftERC1155
        break;
      default:
        erc = nftERC721
        break;
    }
    try {
      let hasToken = await erc.checkTokens(address, tokenArray[index].contract, tokenArray[index].token_ids);
      if (hasToken) {
        return true
      }
    } catch (e) {
      console_log("checkError")
      console_log(e)
    }
    
  }

  return false
}
