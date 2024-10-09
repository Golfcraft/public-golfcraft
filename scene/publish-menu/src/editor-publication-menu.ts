import {getTexture} from "../../src/components/ui/ui-texture";
import {getCanvas} from "../../golfplay/services/canvas";
import {bridgeURL} from "../../src/components/bridge/bridge-url";
import {getProvider} from "@decentraland/web3-provider";
import {signedFetch} from "@decentraland/SignedFetch";
import GolfcraftLandAbi = require("./GolfcraftLand.abi.json")
import * as eth from "eth-connect";
import {showMessage} from "../../src/components/server-notification";
import {sleep} from "../../../common/utils";

declare const console;
const TITLE = "PUBLISH GOLF COURSE NFT";

export const createPublicationMenu = async ({PlayFabId, playerDisplayName}) => {
    const provider = await getProvider();
    const metaRequestManager: any = new eth.RequestManager(provider);
    const GolfcraftLandContract: any = await new eth.ContractFactory(metaRequestManager, GolfcraftLandAbi).at("0x0776CD532B1A2c899BE7323951aE4Ca1801edD94");
    const canvas = getCanvas();
    const container = new UIContainerRect(canvas);
    container.visible = false;
    const callbacks = {onClose:null};
    const state = {
        enabled:false,
        loading:false,
        necessaryParts:null,
        tokenId:null,
        courseID:null,
        address:null,
        alias:null,
        displayName:null
    };
    container.hAlign = "right";
    container.vAlign = "top";
    container.color = new Color4(0,0,0,0.8);
    container.width = 600;
    container.height = 520;
    container.positionX = -10;

    const title = new UIText(container);
    title.vAlign = "top";
    title.vTextAlign = "top";
    title.hTextAlign = "center";
    title.hAlign = "center";
    title.fontSize = 20;
    title.paddingTop = 10;
    title.value = TITLE;

    const content = new UIText(container);
    content.vAlign = "top";
    content.vTextAlign = "top";
    content.hTextAlign = "left";
    content.hAlign = "center";
    content.fontSize = 14;
    content.paddingTop = 10;
    content.value = TITLE;
    content.positionY = -80;
    content.positionX = -80
    content.value = "Loading ...";
    //"golfplay/images/spritesheet.png"
    const spriteTexture = getTexture("images/spritesheet.png");
    const submit = new UIImage(container, spriteTexture);
    Object.assign(submit, {
        sourceWidth:128,
        sourceHeight:64,
        sourceLeft:128,
        sourceTop:32
    })
    submit.vAlign = "bottom";
    submit.hAlign = "right";
    submit.width = 60;
    submit.height = 30;
    submit.positionY = 10;
    submit.positionX = -10;
    submit.opacity = 0.2;
    submit.onClick = new OnClick(async ()=>{
        if(!state.enabled) return;
        if(state.loading) return;
        try{
            state.loading = true;
            const publishResult = await publishMap({
                courseID:state.courseID,
                address:state.address,
                tokenId:state.tokenId,
                necessaryParts:state.necessaryParts,
                PlayFabId,
                alias:state.alias,
                playerDisplayName,
                displayName:state.displayName
            });
            console.log("publishResult", publishResult);
            container.visible = false;
            state.enabled = true;
            state.loading = false;
            // @ts-ignore
            callbacks.onClose && callbacks.onClose({ok:true});
        }catch(error){
            console.log("error", error)
            state.enabled = true;
            state.loading = false;
            callbacks.onClose && callbacks.onClose({error});
        }

    });
    const exit = new UIImage(container, spriteTexture);
    Object.assign(exit, {
        sourceWidth:128,
        sourceHeight:64,
        sourceLeft:0,
        sourceTop:32
    });
    exit.vAlign = "bottom";
    exit.hAlign = "left";
    exit.width = 60;
    exit.height = 30;
    exit.positionX = 10;
    exit.positionY = 10;
    exit.onClick = new OnClick(()=>{
        state.enabled = false;
        state.loading = false;
        content.value = "";
        container.visible = false;
        // @ts-ignore
        callbacks.onClose && callbacks.onClose({cancel:true});
    });

    return {
        open,
        onClose:(fn)=>{
            callbacks.onClose = fn
            return () => callbacks.onClose = null;
        }
    };

    async function publishMap({alias, courseID, address, tokenId, necessaryParts, PlayFabId, playerDisplayName, displayName = alias}){
        const nonce = await fetch(`${bridgeURL}/nonce-golfland/${address}`).then(r => r.json()).then(d => d.result);
        /**
         * @dev Move parts to land.
         * @param landId - the land to move parts to
         * @param partIds - the array of parts to move
         * @param amounts - the array of amounts of parts to move
         */

        const partIDs:number[] = Array.from(new Set(Object.values(necessaryParts).map(part=>part.ID)));

        const partAmounts:number[] = Array.from(new Set(Object.values(necessaryParts))).reduce((acc:number[], current:any)=>{
            return [...acc, necessaryParts[current.alias].amount] as number[];
        },[]);
        console.log("Signing moveParts function with", tokenId, partIDs, partAmounts);

        const functionSignature = GolfcraftLandContract.movePartsToLand.toPayload(tokenId, partIDs, partAmounts).data;//TODO
        const message = {
            nonce,
            from: address,
            functionSignature
        };
        let chainId = 137;
        let domainData = {
            name:"GolfcraftLand",
            version:"1",
            verifyingContract: "0x0776CD532B1A2c899BE7323951aE4Ca1801edD94",
            salt: getSalt(chainId)
        };
        const domainType = [
            {name: "name", type: "string"},
            {name: "version", type: "string"},
            {name: "verifyingContract", type: "address"},
            {name: "salt", type: "bytes32"},
        ];
        const metaTransactionType = [
            {name: "nonce", type: "uint256"},
            {name: "from", type: "address"},
            {name: "functionSignature", type: "bytes"}
        ];
        const dataToSign = {
            types: {
                EIP712Domain: domainType,
                MetaTransaction: metaTransactionType
            },
            domain: domainData,
            primaryType: "MetaTransaction",
            message
        };
        const necessaryPartsCollection = Object.values(necessaryParts);
        if(necessaryPartsCollection?.length){
            const {signature} = await requestTypedV4Signature(await getProvider(), message.from, dataToSign);
            const {r, s, v} = getSignatureParameters(signature);

            const publishRequestResult = await signedFetch(`${bridgeURL}/publish-golf-land`, {
                method: "POST",
                body: JSON.stringify({
                    from: message.from,
                    PlayFabId,
                    signature,
                    r, s, v,
                    signatureType: "EIP712Sign",
                    functionSignature,
                    nonce,
                    address,
                    preData:{
                        courseID,
                        address,
                        tokenId,
                        alias,
                        playerDisplayName,
                        displayName
                    }
                }),
                headers: {"Content-Type": "application/json"},
            });
            console.log("publishRequestResult",publishRequestResult);
            return publishRequestResult;
        }else{
            const publishRequestResult = await signedFetch(`${bridgeURL}/publish-golf-land`, {
                method: "POST",
                body: JSON.stringify({
                    from: message.from,
                    PlayFabId,
                    address,
                    preData:{
                        courseID,
                        address,
                        tokenId,
                        alias,
                        playerDisplayName,
                        displayName
                    }
                }),
                headers: {"Content-Type": "application/json"},
            });
            console.log("publishRequestResult",publishRequestResult);
            return publishRequestResult;
        }

    }

    function open({ID, alias, availableParts, necessaryParts, golfLandTokenId, pristineGolfLandBalance, address, displayName, collectionId}:any){
        const LAND_NAME = {
            0:"Egypt",
            1:"Space",
            2:"Urban",
            3:"Jungle",
            4:"Mountain",
            5:"Cocobay"
        }
        container.visible = true;
        state.necessaryParts = necessaryParts;
        state.tokenId = golfLandTokenId;
        state.address = address;
        state.courseID = ID;
        state.alias = alias;
        state.displayName = displayName;
        console.log("open", JSON.stringify({ID, alias, availableParts, necessaryParts, golfLandTokenId, pristineGolfLandBalance, address}))

        const missingParts = getMissingParts(availableParts, necessaryParts);
        title.value = TITLE + `\n${alias}`;
        console.log("open publishMap",{ID, alias, availableParts, necessaryParts, golfLandTokenId, pristineGolfLandBalance, address})
        if(!golfLandTokenId && !pristineGolfLandBalance){
            content.value = `You need Golfcraft "${LAND_NAME[collectionId]}" Land NFT to publish this map\n`;
            //content.value += missingParts.join(`\n`);
            //content.value += `</color>`;
            state.enabled = false;
            submit.opacity = 0.03;
        }else if(!missingParts){
            content.value = `You are ready to publish your GolfCourse NFT #${golfLandTokenId}\n`;
            const necessaryPartsCollection = Object.values(necessaryParts);
            if(necessaryPartsCollection.length){
                content.value += `\nFollowing parts will be sent from your wallet to the Golf-Land:\n`;
                content.value += necessaryPartsCollection.map(p=>`${p.alias}: ${p.amount}`).join(`\n`);
            }else{
                content.value += `\nNo parts will be moved.`
            }
            state.enabled = true;
            submit.opacity = 1;
        }
        if(missingParts){
            content.value += `\nYou miss some parts to mint this map:\n\n`;
            content.value += missingParts.join(`\n`);
            state.enabled = false;
            submit.opacity = 0.03;
        }

        function getMissingParts(availableParts, necessaryParts){
            const missingParts = Object.keys(necessaryParts).reduce((acc, key:string)=>{
                if(!(availableParts[key]?.amount >= necessaryParts[key].amount)){
                    const currentAmount = availableParts[key]?.amount || 0;
                    acc.push(`${key} : ${necessaryParts[key].amount - currentAmount}`)
                }
                return acc;
            },[] as any)
            return missingParts?.length && missingParts;
        }
    }
}

function requestTypedV4Signature(provider, address, dataToSign) {
    return new Promise((resolve, reject) => {
        provider.sendAsync(
            {
                jsonrpc: '2.0',
                id: 1,
                method: "eth_signTypedData_v4",
                params: [
                    address,
                    JSON.stringify(dataToSign)
                ],
                from: address
            }, (error: any, response: any) => {
                if (error) {
                    reject(error)
                } else {
                    resolve({signature: response.result, dataToSign});
                }
            }
        );
    });
}
function getSignatureParameters(signature) {
    var r = signature.slice(0, 66);
    var s = "0x".concat(signature.slice(66, 130));
    var vs = "0x".concat(signature.slice(130, 132));
    var v = Number(vs);
    if (![27, 28].includes(v)) v += 27;
    return {
        r: r,
        s: s,
        v: v
    };
};

function getSalt(chainId: number | string): string {
    if (typeof chainId === 'number') {
        return `0x${to32Bytes(chainId.toString(16))}`
    }

    return `0x${to32Bytes(chainId)}`
}

function to32Bytes(value: number | string): string {
    return value
        .toString()
        .replace('0x', '')
        .padStart(64, '0')
}

