import { signedFetch } from '@decentraland/SignedFetch';
import * as utils from '@dcl/ecs-scene-utils';
import * as ui from '@dcl/ui-scene-utils';
import { getUserData } from '@decentraland/Identity';
import {getGLTFShape} from "../../golfplay/services/resource-repo";
import { registerSound, reproduceAvatarSound } from "../services/avatar-sound";

registerSound("ui_wbl_accept");
registerSound("ui_wbl_cancel");
registerSound("ui_wbl_click");
registerSound("ui_wbl_error_tickets");

const ENDPOINT = 'https://golfcraftgame.com/fashion/buy-wearable-ft';
//const ENDPOINT = 'https://golfcraftgame.com/bridge/buy-wearable-ft';
//const ENDPOINT = 'http://localhost:2568/buy-wearable-ft';


const priceIconTexutre = new Texture(`images/fashionTicket.png`);
const priceIconTexutreAlpha = new Texture(`images/fashionTicket-alpha.png`);
const priceIconMaterial = new Material();
priceIconMaterial.albedoTexture = priceIconTexutre;
priceIconMaterial.alphaTexture = priceIconTexutreAlpha;


export function createFashionStore({name, ftprice, stock, wearableId, contract, position, rotation, offset, modelSrc, label, minPlayerLevel, maxMintsByAddress, onSale}){
    let fashiontickets = 0;
    let playfabid = "";
    let userid = "";
    let claim_prompt= false

    const state = {loading:false};

    // Offset to match with building
    const offsetEntity = new Entity();
    //offsetEntity.addComponent(new BoxShape())
    offsetEntity.addComponent(new Transform({
        position: new Vector3(24*2, 0, 24*2),
        rotation: Quaternion.Euler(0, 0, 0)
    }));

    const offset2Entity = new Entity();
    offset2Entity.addComponent(new Transform({
        position,
        rotation
    }));
    offset2Entity.setParent(offsetEntity);
    
    const coreEntity = new Entity();
    coreEntity.addComponent(new Transform({
        position: offset,
    }));
    coreEntity.setParent(offset2Entity);

    buildStand(
        name,
        ftprice,
        stock,
        coreEntity,
        wearableId,
        contract,
        modelSrc,
        label,
        minPlayerLevel,
        maxMintsByAddress
    );
    showFashionStore();

    return {
        setUserData,
        hideFashionStore,
        showFashionStore
    };

    function setUserData(user_data: any) {
        if(!user_data) return;
        if (user_data.FT !== undefined) {
            fashiontickets = user_data.FT;
        }
        if (user_data.PlayFabId) {
            playfabid = user_data.PlayFabId;
        }
        if (user_data.userId) {
            userid = user_data.userId;
        }
    }

    function hideFashionStore() {
        engine.removeEntity(offsetEntity);
    }

    function showFashionStore() {
        engine.addEntity(offsetEntity);
    }

    function buildStand(name:string, ftprice: number, stock: number, core: Entity, wearableId: number, contract: string, modelSrc:string, label:string, minPlayerLevel: number, maxMintsByAddress: number) {
        const standEntity = new Entity();
        standEntity.addComponent(getGLTFShape("models/fashion/wearable-data.glb"));
        standEntity.addComponent(priceIconMaterial);
        const pointerComponent = new OnPointerDown(
            async () => {
                if(state.loading) return;
                if (claim_prompt) {
                    return;
                }
                reproduceAvatarSound("ui_wbl_click");
                /*if (Math.random() < 0.5) {
                    ui.displayAnnouncement("Too many requests, try again in 10 seconds.");
                    return;
                }*/
                claim_prompt = true;
                let prompt = new ui.OptionPrompt(
                    `Claiming a ${name}`,
                    `Claim ${name} for ${ftprice} Fashion Tickets`,
                    async () => {
                        log(`Claim`)
                        claim_prompt = false;
                        if (ftprice > fashiontickets) {
                            ui.displayAnnouncement("You don't have enough FashionTickets");
                            reproduceAvatarSound("ui_wbl_error_tickets");
                            return;
                        }
                        setLoading(true);
                        reproduceAvatarSound("ui_wbl_accept");

                        let response
                        try{
                            const user = await getUserData();
                            response = await signedFetch(ENDPOINT, {
                                method:'POST',
                                body:JSON.stringify({
                                    wearableId:wearableId,
                                    contract:contract,
                                    PlayFabId: playfabid,
                                    address: userid,
                                    displayName:user.displayName,
                                    user:{
                                        displayName:user.displayName
                                    }
                                }),
                                headers:{
                                    "Content-Type":"application/json"
                                }
                            })
                        }catch(err){
                            log("fetch error",err);
                            setLoading(false);
                            ui.displayAnnouncement(err && (err.error || err.data.message) || err)
                            reproduceAvatarSound("ui_servererror");
                        }

                        log(response)

                        let json
                        if (response.text) {
                            json = await JSON.parse(response.text)
                            log(json);
                            setLoading(false);
                        }

                        if (json && json.ok === true) {
                            onSale && onSale();
                            log('All good');
                            ui.displayAnnouncement('Success!')
                            setLoading(false);
                            reproduceAvatarSound("ui_wbl_accept");
                        } else {
                            log('Not valid')
                            ui.displayAnnouncement(json.error)
                            setLoading(false);
                            reproduceAvatarSound("ui_servererror");
                        }
                    },
                    () => {
                        log(`Cancel`)
                        claim_prompt = false;
                        reproduceAvatarSound("ui_wbl_cancel");
                    },
                    'Claim',
                    'Cancel'
                );
                prompt.closeIcon.onClick = new OnClick(()=>{
                    prompt.close();
                    claim_prompt = false
                });
            },
            {
                hoverText: `Claim ${name} for ${ftprice} Fashion Tickets`,
                button: ActionButton.POINTER
            }
        )
        standEntity.addComponent(pointerComponent)
        standEntity.addComponent(new Transform({
            position: new Vector3(-0.1, -0.4, 0.4)
        }))
        standEntity.setParent(core)

        /*
        const modelEntity = new Entity();
        modelEntity.setParent(core);
        modelEntity.addComponent(new Transform({
            position: new Vector3(0,1-1,0)
        }))
        modelEntity.addComponent(new GLTFShape(modelSrc));
        */

        if (label != "") {
            const brandEntity = new Entity();
            brandEntity.setParent(core);
            brandEntity.addComponent(new Transform({
                position: new Vector3(0,1,0),
                rotation: Quaternion.Euler(180, 0, 0)
            }))
            const shape = new PlaneShape()
            brandEntity.addComponent(shape);
            const material = new BasicMaterial();
            material.texture = new Texture(`images/wearables/${label}`);
            brandEntity.addComponent(material);
            /*
            if (brandTeleport != "") {
                brandEntity.addComponent(new OnPointerDown(() => {
                    teleportTo(brandTeleport);
                },
                {
                    hoverText: `Go to ${brandName}`,
                    button: ActionButton.POINTER
                }))
            }*/
        }

        const price = new Entity();
        price.setParent(core);
        price.addComponent(new Transform({
            position:new Vector3(0,0.3-0.2,0.51)
        }))
        const priceIcon = new Entity();
        priceIcon.setParent(price);
        priceIcon.addComponent(new PlaneShape());
        priceIcon.addComponent(priceIconMaterial);
        priceIcon.addComponent(new Transform({
            position:new Vector3(-0.3,0.05-0.4,0),
            scale:new Vector3(-0.4,-0.4,-0.4)
        }))

        const nameLabel = new Entity();
        const nametext = new TextShape();
        nametext.value = name;
        nametext.fontSize = 3;
        nametext.color = Color3.Black();
        nametext.hTextAlign = "left";
        nameLabel.addComponent(new Transform({
            position:new Vector3(0.35, -0.1, 0), 
            scale:new Vector3(-0.4, 0.4, 0.4)
        }))
        nameLabel.addComponent(nametext);
        nameLabel.setParent(price);

        const priceLabel = new Entity();
        const text = new TextShape();
        text.value = ftprice.toString();
        text.fontSize = 5;
        text.color = Color3.Black();
        text.hTextAlign = "left";
        priceLabel.addComponent(new Transform({
            position:new Vector3(0.35,0.1-0.4,0),
            scale:new Vector3(-0.4,0.4,0.4)
        }))
        priceLabel.addComponent(text);
        priceLabel.setParent(price);

        const stockLabel = new Entity();
        const stock_text = new TextShape();
        stock_text.value = `Stock: ${stock}`;
        stock_text.fontSize = 3;
        stock_text.color = Color3.Black();
        stock_text.hTextAlign = "left";
        stockLabel.addComponent(new Transform({
            position:new Vector3(0.35,-0.1-0.4,0),
            scale:new Vector3(-0.4,0.4,0.4)
        }))
        stockLabel.addComponent(stock_text);
        stockLabel.setParent(price);

        if (minPlayerLevel > -1) {
            const levelLabel = new Entity();
            const level_text = new TextShape();
            level_text.value = `Min Level: ${minPlayerLevel}`;
            level_text.fontSize = 3;
            level_text.color = Color3.Black();
            level_text.hTextAlign = "left";
            levelLabel.addComponent(new Transform({
                position:new Vector3(0.35,-0.1-0.5,0),
                scale:new Vector3(-0.4,0.4,0.4)
            }))
            levelLabel.addComponent(level_text);
            levelLabel.setParent(price);
        }

        if (maxMintsByAddress > -1) {
            const mintsLabel = new Entity();
            const mints_text = new TextShape();
            mints_text.value = `Max Mints: ${maxMintsByAddress}`;
            mints_text.fontSize = 3;
            mints_text.color = Color3.Black();
            mints_text.hTextAlign = "left";
            mintsLabel.addComponent(new Transform({
                position:new Vector3(0.35,-0.1-0.6,0),
                scale:new Vector3(-0.4,0.4,0.4)
            }))
            mintsLabel.addComponent(mints_text);
            mintsLabel.setParent(price);
        }

        const expirationLabel = new Entity();
        const expirationtext = new TextShape();
        expirationtext.value = "Available until:\n"; // TODO set date
        expirationtext.fontSize = 2;
        expirationtext.color = Color3.Black();
        expirationtext.hTextAlign = "left";
        expirationLabel.addComponent(new Transform({
            position:new Vector3(0.35,-0.1-0.75,0), 
            scale:new Vector3(-0.4, 0.4, 0.4)
        }))
        expirationLabel.addComponent(expirationtext);
        expirationLabel.setParent(price);

        return standEntity;

        function setLoading(value){
            state.loading = value;
            if(state.loading){
                pointerComponent.hoverText = "Loading...";
            }else{
                pointerComponent.hoverText =  `Claim ${name} for ${ftprice} Fashion`;
            }
        }
    }

}
