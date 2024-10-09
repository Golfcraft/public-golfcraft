import { signedFetch } from '@decentraland/SignedFetch';
import * as ui from '@dcl/ui-scene-utils';
import { getUserData } from '@decentraland/Identity';

const ENDPOINT = 'https://service.golfcraftgame.com/golfcraft-surprise/buy-pet-pt';
//const ENDPOINT = 'http://localhost:2568/buy-pet-pt';

export function createPetStore({crateId, name, ptprice, position, rotation, onSale}){
    let pettickets = 0;
    let playfabid = "";
    let userid = "";
    let claim_prompt= false

    const state = {loading:false};
    const coreEntity = new Entity();
    coreEntity.addComponent(new Transform({
        position,
        rotation
    }));

    buildStand(
        crateId,
        name,
        ptprice,
        coreEntity
    );
    showFashionStore();

    return {
        setUserData,
        hideFashionStore,
        showFashionStore
    };

    function setUserData(user_data: any) {
        if(!user_data) return;
        if (user_data.PT !== undefined) {
            pettickets = user_data.PT;
        }
        if (user_data.PlayFabId) {
            playfabid = user_data.PlayFabId;
        }
        if (user_data.userId) {
            userid = user_data.userId;
        }
    }

    function hideFashionStore() {
        engine.removeEntity(coreEntity);
    }

    function showFashionStore() {
        engine.addEntity(coreEntity);
    }

    function buildStand(crateId: string, name:string, ptprice: number, core: Entity) {
        const standEntity = new Entity();
        standEntity.addComponent(new GLTFShape("models/fashion-stand.glb"));
        const pointerComponent = new OnPointerDown(
            async () => {
                if(state.loading) return;
                if (claim_prompt) {
                    return;
                }
                claim_prompt = true;
                let prompt = new ui.OptionPrompt(
                    `Opening a ${name}`,
                    `Open ${name} for ${ptprice} Surprise Tickets`,
                    async () => {
                        log(`Claim`)
                        claim_prompt = false;
                        if (ptprice > pettickets) {
                            ui.displayAnnouncement("You don't have enough Surprise Tickets");
                            return;
                        }
                        setLoading(true);

                        let response
                        try{
                            const user = await getUserData();
                            response = await signedFetch(ENDPOINT, {
                                method:'POST',
                                body:JSON.stringify({
                                    crateId:crateId,
                                    PlayFabId: playfabid,
                                    address: userid,
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
                        }

                        log(response)

                        let json
                        if (response.text) {
                            json = await JSON.parse(response.text)
                            log(json);
                            //setLoading(false);
                        }

                        /*if (json && json.valid === true) {
                            log('All good');
                            // ui.displayAnnouncement('Success!')
                            setLoading(false);
                        } else {
                            log('Not valid')
                            //ui.displayAnnouncement(json.error)
                            setLoading(false);
                        }*/
                        onSale && onSale();
                        setLoading(false);
                        let prompt = new ui.OkPrompt(json.message);
                    },
                    () => {
                        log(`Cancel`)
                        claim_prompt = false;
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
                hoverText: `Open ${name} for ${ptprice} Surprise Tickets`,
                button: ActionButton.POINTER
            }
        )
        standEntity.addComponent(pointerComponent)
        standEntity.setParent(core)

        const modelEntity = new Entity();
        modelEntity.setParent(core);
        modelEntity.addComponent(new Transform({
            position: new Vector3(0,1,0)
        }))
        modelEntity.addComponent(new GLTFShape(`models/pets/${crateId}.glb`));
        let animator = new Animator();
        modelEntity.addComponent(animator);
        const clipSwim = new AnimationState("main");
        animator.addClip(clipSwim);
        clipSwim.play();

        const price = new Entity();
        price.setParent(core);
        price.addComponent(new Transform({
            position:new Vector3(0,0.3,0.51)
        }))
        const priceIcon = new Entity();
        priceIcon.setParent(price);
        priceIcon.addComponent(new PlaneShape());
        const priceIconTexutre = new Texture(`images/surpriseTicket.png`);
        const priceIconTexutreAlpha = new Texture(`images/fashionTicket-alpha.png`);
        const priceIconMaterial = new Material();
        priceIconMaterial.albedoTexture = priceIconTexutre;
        priceIconMaterial.alphaTexture = priceIconTexutreAlpha;
        priceIcon.addComponent(priceIconMaterial);
        priceIcon.addComponent(new Transform({
            position:new Vector3(-0.3,0.05,0),
            scale:new Vector3(-0.4,-0.4,-0.4)
        }))

        const priceLabel = new Entity();
        const text = new TextShape();
        text.value = ptprice.toString();
        text.fontSize = 5;
        text.color = Color3.Black();
        text.hTextAlign = "left";
        priceLabel.addComponent(new Transform({
            position:new Vector3(0.35,0.1,0),
            scale:new Vector3(-0.4,0.4,0.4)
        }))
        priceLabel.addComponent(text);
        priceLabel.setParent(price);

        return standEntity;

        function setLoading(value){
            state.loading = value;
            if(state.loading){
                pointerComponent.hoverText = "Loading...";
            }else{
                pointerComponent.hoverText =  `Open ${name} for ${ptprice} Surprise Tickets`;
            }
        }
    }

}
