import {contractAddress} from "../../../../common/contractAddress";
import parcelContractAbi from "../../../../common/parcelContractAbi";
import estateContractAbi from "../../../../common/estateContractAbi";
import {isParcel} from "../../lib/landUtils";
const Web3 = require('web3');

declare const ethereum;

export const web3 = new Web3(ethereum);

export const contracts = {
    parcel: new web3.eth.Contract(parcelContractAbi, contractAddress.mainnet.parcel),
    estate: new web3.eth.Contract(estateContractAbi, contractAddress.mainnet.estate)
}

export const encodeTokenId = async (entityID) => {
    if(isParcel(entityID)){
        const coords = entityID.split(",");
        return (await contracts.parcel.methods.encodeTokenId(Number(coords[0]), Number(coords[1])).call()).toString();
    } else {
        return entityID;
    }
}

export const isUpdateAuthorized = async (entityID, address) => {
    if(isParcel(entityID)){
        const tokenId = await encodeTokenId(entityID);
        
        return (await contracts.parcel.methods.isUpdateAuthorized(address, tokenId).call()).toString();
    } else {
        return (await contracts.estate.methods.isUpdateAuthorized(address, entityID).call()).toString();
    }
};

export const setUpdateOperator = async (account, entityID, clientAddress) => {
    if(isParcel(entityID)){
        const tokenId = await encodeTokenId(entityID);        
        web3.eth.defaultAccount = account.address;
        const gas = await contracts.parcel.methods.setUpdateOperator(            
            tokenId,
            clientAddress
            ).estimateGas({
                from:account.address,
                //gasPrice:50
            });

        return (await contracts.parcel.methods.setUpdateOperator(tokenId, clientAddress).send({
            from:web3.eth.defaultAccount,
            gas
        }));
    } else {
        return await contracts.estate.methods.setUpdateOperator(entityID, clientAddress).send();
    }
}
