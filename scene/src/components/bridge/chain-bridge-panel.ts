import {getGLTFShape} from "../../../golfplay/services/resource-repo";
import {globalStore} from "../../services/globalStore/globalStore";
import {createImageButton} from "../imageButton";
import {signedFetch} from "@decentraland/SignedFetch";
import * as ui from "@dcl/ui-scene-utils";
import {showMessage} from "../server-notification";
import {refreshUserData} from "../../services/userData";
import * as eth from "eth-connect";
import materialsBurnAbi = require("./materials-burn-abi.json");
import {getProvider} from "@decentraland/web3-provider";
import {bridgeURL} from "./bridge-url";
import {createNumberPrompt} from "./number-prompt";
import {sleep} from "../../../../common/utils";
import { reproduceAvatarSound } from "../../services/avatar-sound";


const MATERIALS_CONTRACT_ADDRESS = `0xb50e29a3ccf7c0ab133ea7de46b09d0d8feafdf0`;
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
export const createChainBridgePanel = async (parent, {
    position,
    rotation = new Quaternion(0, 0, 0, 0),
    VirtualCurrency = "FT",
    VirtualCurrencyName = "Fashion Tickets",
    tokenId,
    stack = 1,
    storeName,
    isOnlyRefine = false,
    hideMoveToChain = false
}) => {
    const provider = await getProvider();
    const metaRequestManager: any = new eth.RequestManager(provider);

    let materialsContract: any = await new eth.ContractFactory(metaRequestManager, materialsBurnAbi).at(MATERIALS_CONTRACT_ADDRESS);
    const state = {
        sending: false,
        pending: true
    };
    const entity = new Entity();
    entity.setParent(parent);
    entity.addComponent(new Transform({
        position,
        rotation
    }));

    const screen = new Entity();
    const shape = getGLTFShape(`models/board.glb`);
    screen.setParent(entity);
    screen.addComponent(shape);

    const entityFT = new Entity();
    const labelFT = new TextShape(getTitle());
    labelFT.fontSize = 2;

    entityFT.addComponent(labelFT);
    entityFT.addComponent(new Transform({
        position: new Vector3(0, 3, 0)
    }))
    entityFT.setParent(entity);

    globalStore.userData.onChange(({newValue, oldValue, prop}) => {
        if (prop === storeName || prop === VirtualCurrency) {
            labelFT.value = getTitle();
        }
    });
    globalStore.game.onChange(hideOrShow, "playing");
    globalStore.game.onChange(hideOrShow, "editing");

    function hideOrShow({newValue, oldValue, prop}){
        if(newValue && !oldValue){
            hide();
        }else if(oldValue && !newValue){
            show();
        }
    }
    function getTitle(){
        const serviceName = isOnlyRefine?"refinery":"bridge";
        if(stack > 1){
            return `${stack} ${VirtualCurrencyName} ${serviceName} (game | chain)\n ${Math.floor((globalStore.userData.getState()[VirtualCurrency]||0)/stack)} in-game | ${globalStore.userData.getState()[storeName]||0} on-chain`;
        }else{
            return `${VirtualCurrencyName} ${serviceName} (game | chain)\n ${globalStore.userData.getState()[VirtualCurrency]||0} in-game | ${globalStore.userData.getState()[storeName]||0} on-chain`;
        }

    }

    const moveToChainButton = !hideMoveToChain && createImageButton(entity, {
        position: new Vector3(-1.1, 2, 0),
        rotation: Quaternion.Zero(),
        scale: new Vector3(-1.5, -0.5, -1),
        imageSrc: `images/move-to-chain.png`,
        alphaSrc: ``,
        hoverText: isOnlyRefine?`Refine 100 ${VirtualCurrencyName} into chain ${storeName}`: `Move ${VirtualCurrencyName} to 0xPolygon`,
    });

    const moveToGameButton = createImageButton(entity, {
        position: new Vector3(1.1, 2, 0),
        rotation: Quaternion.Zero(),
        scale: new Vector3(-1.5, -0.5, -1),
        imageSrc: `images/move-to-game.png`,
        alphaSrc: ``,
        hoverText: `Move ${VirtualCurrencyName} to game`
    });
    const tradeButton = createImageButton(entity, {
        position: new Vector3(0, 1.4, 0),
        rotation: Quaternion.Zero(),
        scale: new Vector3(-1.5, -0.5, -1),
        imageSrc: `images/trade.png`,
        alphaSrc: ``,
        hoverText: `Trade ${VirtualCurrencyName} in opensea`
    });
    tradeButton?.onClick(() => {
        openExternalURL(`https://opensea.io/collection/golfcraftmaterials`)
    })
    let checkPendingInterval;

    checkPending();

    const address = globalStore?.userData?.getState()?.userId;
    const PlayFabId = globalStore?.userData?.getState()?.PlayFabId;
    const prompt: any = stack > 1 ?
        createNumberPrompt({
            onSubmit: (value) => executeGameToChain({value, tokenId, address, PlayFabId}), title: "Game to chain", stack,
            onReject: () => {moveToChainButton.show()}
        })
        : new ui.FillInPrompt(
            "Game to Chain",
            async (value: string) => executeGameToChain({value, tokenId, address, PlayFabId}),
            'Submit!',
            "Enter amount here"
        );

    if (prompt.closeIcon) {
        prompt.closeIcon.onClick = new OnPointerDown((e)=>{
            prompt.hide();
            moveToChainButton?.show();
        });
    }

    const prompt2 = new ui.FillInPrompt("Chain to game", (value: string) => executeChainToGame({
            value,
            tokenId
        }), "Submit", "Enter amount here");
    prompt2.closeIcon.onClick = new OnPointerDown((e)=>{
        prompt2.hide();
        moveToGameButton?.show();
    });

    prompt.hide();
    prompt2.hide();
    if(moveToChainButton){
        moveToChainButton.onClick(() => {
            if (state.sending) return;
            prompt.show();
            moveToChainButton.hide();
        });
    }

    console.log("moveToGameButton",moveToGameButton)
    moveToGameButton.onClick(() => {
        if (state.sending) return;
        prompt2.show();
        moveToGameButton?.hide();
    });

    if(isOnlyRefine){
        moveToGameButton?.hide();
        moveToChainButton?.setTexture(`images/refine-${storeName}.png`);
        moveToChainButton?.setPosition(0, 2, 0);
        moveToChainButton?.setEmissive(false);
    }

    function show(){
        entity.setParent(parent);
    }
    function hide(){
        entity.setParent(null);
        engine.removeEntity(entity);
    }

    return {
        hide,
        show
    }

    async function executeChainToGame({value, tokenId,}) {
        if (!await handlePromptValue(prompt, value, moveToGameButton, () => globalStore.userData.getState()[storeName] >= Number(value))) return;

        const nonce = await fetch(`${bridgeURL}/nonce/${address}`).then(r => r.json()).then(d => d.result);
        const functionSignature = materialsContract.burn.toPayload(address, tokenId, Number(value)).data;
        const message = {
            nonce,
            from: address,
            functionSignature
        };
        tryRequest(async () => await sendMetaTransactions({
            functionSignature,
            VirtualCurrency,
            message,
            name: "GolfcraftMaterials",
            version: "1",
            PlayFabId,
            Amount: Number(value),
            nonce,
            stack,
            tokenId
        }));
    }
    async function executeGameToChain({value, tokenId, address, PlayFabId}) {
        console.log("GameToChain", Number(value), storeName, globalStore.userData.getState()[VirtualCurrency])
        if (!await handlePromptValue(prompt, value, moveToChainButton, () => globalStore.userData.getState()[VirtualCurrency] >= Number(value))) {
            return false;
        }

        await tryRequest(async () => {
            const url = `${bridgeURL}/game-to-chain`;
            return await signedFetch(
                url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        VirtualCurrency,
                        Amount: Number(value),
                        tokenId,
                        address,
                        PlayFabId,
                        stack
                    })
                });
        });
        refreshUserData();
    }
    async function tryRequest(fn) {
        try {
            const result = await fn();
            if (result.error) {
                showMessage({timeout: 5000, message: result.error});
                state.sending = false;
                prompt.hide();
                return;
            }

            showMessage({timeout: 5000, message: "Your request has been sent"});
            checkPending();
            state.sending = false;
            prompt.hide();
        } catch (error) {
            console.error(error);
            showMessage({timeout: 5000, message: "An error happened trying to reach the server."});
            state.sending = false;
            prompt.hide();
            reproduceAvatarSound("ui_servererror");
        }
    }
    async function handlePromptValue(prompt, value, button, balanceCheck) {
        await refreshUserData();
        if (!value) {
            prompt.hide();
            button?.show();
            return;
        }
        const Amount = Number(value);
        if (isNaN(Amount)) {
            showMessage({timeout: 5000, message: "Wrong value"});
            prompt.hide();
            button?.show();
            reproduceAvatarSound("ui_servererror");
            return;
        }
        if (!balanceCheck()) {
            showMessage({timeout: 5000, message: `You don't have enough ${VirtualCurrencyName}`});
            prompt.hide();
            button?.show();
            return;
        }

        return true;
    }
    function checkPending() {
        if (state.pending) {
            moveToChainButton && moveToChainButton?.hide();
            moveToGameButton && moveToGameButton?.hide();
            checkPendingInterval = setInterval(async () => {
                const isPending = await fetch(`${bridgeURL}/is-address-available/${address}`).then(r => r.json()).then(d => !d.result);
                if (!isPending) {
                    clearInterval(checkPendingInterval);
                    await sleep(1000);
                    await refreshUserData();
                    moveToGameButton.show();
                    if(isOnlyRefine){
                        moveToGameButton.hide();
                    }
                    moveToChainButton && moveToChainButton?.show();
                }
            }, 10000)
        } else {
            moveToGameButton.show();
            moveToChainButton && moveToChainButton?.show();
        }
        if(isOnlyRefine){
            moveToGameButton.hide();
        }
    }
};

async function sendMetaTransactions({functionSignature, VirtualCurrency, message, name, version, PlayFabId, Amount, nonce, stack, tokenId}) {
    let chainId = 137;

    let domainData = {
        name,
        version,
        verifyingContract: MATERIALS_CONTRACT_ADDRESS,
        salt: getSalt(chainId)
    };


    const dataToSign = {
        types: {
            EIP712Domain: domainType,
            MetaTransaction: metaTransactionType
        },
        domain: domainData,
        primaryType: "MetaTransaction",
        message
    };
    const {signature} = await requestTypedV4Signature(await getProvider(), message.from, dataToSign);
    const {r, s, v} = getSignatureParameters(signature)
    return await fetch(`${bridgeURL}/transactions`, {
        method: "POST",
        body: JSON.stringify({
            from: message.from,
            PlayFabId,
            Amount,
            signature,
            r, s, v,
            signatureType: "EIP712Sign",
            functionSignature,
            nonce,
            stack,
            tokenId,
            VirtualCurrency
        }),
        headers: {"Content-Type": "application/json"},
    }).then(r => r.json());
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

export function getSalt(chainId: number | string): string {
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

