import * as ui from '@dcl/ui-scene-utils';
import {
  CompiNPC,
  CompiNPCSystem,
  Blockchain,
  CHARACTER,
  NETWORK
} from '@compicactus/dcl-scene-utils';
const network_compi = new Blockchain(NETWORK.MATIC, CHARACTER.COMPICACTUS)

let compi = showCompicactus()
engine.addSystem(new CompiNPCSystem());

let current_price;

export function hideCompicactus() {
    compi.compi_faq.destroy();
    compi.compi_train.destroy();
    engine.removeEntity(compi.core);
    engine.removeSystem(compi.timer_system);
}

export function showCompicactus() {
    let compi_core = new Entity();
    compi_core.addComponent(new Transform({
        position: new Vector3(0, 0, 0)
    }));
    engine.addEntity(compi_core);

    const block_shape = new GLTFShape('golfplay/models/Bloque1x1x025.gltf')

    // Compi FAQ
    let compi_faq = new CompiNPC(2, network_compi);
    compi_faq.addComponent(new Transform({
        position: new Vector3(24, 1, 3)
    }));
    compi_faq.addComponent(new Billboard(false, true, false));
    compi_faq.setParent(compi_core);

    let block_faq = new Entity();
    block_faq.addComponent(block_shape);
    block_faq.addComponent(new Transform({
        position: new Vector3(24, 0.5, 3)
    }));
    block_faq.setParent(compi_core);


    // Compi TRAIN
    let compi_train = new CompiNPC(-1, network_compi);
    compi_train.addComponent(new Transform({
        //position: new Vector3(22, 0.5, 15),
        position: new Vector3(22, 5.3, 46),
        rotation: Quaternion.Euler(0, -180, 0)
    }));
    //compi_train.addComponent(new Billboard(false, true, false));
    compi_train.setParent(compi_core);

    // Boots
    const boot_train = new Entity();
    boot_train.addComponent(new GLTFShape("models/compicactus/BoothTrain.glb"));
    boot_train.addComponent(new Transform({
        position: new Vector3(0, -0.5, 0),
    }));
    boot_train.setParent(compi_train);

    const boot_mint = new Entity();
    boot_mint.addComponent(new GLTFShape("models/compicactus/BoothMint.glb"));
    boot_mint.addComponent(new Transform({
        position: new Vector3(-3, -0.5, 0),
    }));
    boot_mint.setParent(compi_train);

    const boot_twitter = new Entity()
    boot_twitter.addComponent(new GLTFShape("models/compicactus/BoothTwitter.glb"))
    boot_twitter.addComponent(new Transform({
        position: new Vector3(-5, -0.5, 0),
    }))
    boot_twitter.addComponent(
        new OnPointerDown(async ()=>{
            openExternalURL("https://twitter.com/compicactus")
        },
        {
            hoverText: "Info about Compicactus",
            button: ActionButton.POINTER
        }
    ))
    boot_twitter.setParent(compi_train);

    // Animations
    const error_anim = new Entity()
    const error_shape = new GLTFShape("models/compicactus/Error.glb")
    error_shape.visible = false
    error_anim.addComponent(error_shape)
    error_anim.addComponent(new Transform({
        position: new Vector3(5-8, 1.5-0.5, 0.1),
        scale: new Vector3(4, 4, 4)
    }))
    let animator_error = new Animator()
    error_anim.addComponent(animator_error)
    const clipError = new AnimationState("ArmatureAction")
    animator_error.addClip(clipError)
    error_anim.setParent(compi_train);
    clipError.stop()
    error_anim.addComponent(
        new OnPointerDown(async ()=>{
            clearMessages()
        },
        {
            hoverText: "Ok",
            button: ActionButton.POINTER
        }
    ))

    const success_anim = new Entity()
    const success_shape = new GLTFShape("models/compicactus/Success.glb")
    success_shape.visible = false
    success_anim.addComponent(success_shape)
    success_anim.addComponent(new Transform({
        position: new Vector3(5+0.2-8, 0.7-0.5, 0.1),
        scale: new Vector3(2, 2, 2)
    }))
    let animator_success = new Animator()
    success_anim.addComponent(animator_success)
    const clipSuccess = new AnimationState("CheckAction")
    animator_success.addClip(clipSuccess)
    success_anim.setParent(compi_train);
    clipSuccess.stop()
    success_anim.addComponent(
        new OnPointerDown(async ()=>{
            clearMessages()
        },
        {
            hoverText: "Ok",
            button: ActionButton.POINTER
        }
    ))

    // Mint

    let price: any
    let minting: boolean = false
    let mint_prompt: boolean = false

    boot_mint.addComponent(
        new OnPointerDown(async ()=>{
            if (minting || mint_prompt) {
                return;
            }

            let minting_message = "";
            const human_price = network_compi.wei2human(price[0])
            if (price[1]) {
                minting_message = `Mint 1 Compicactus, ${human_price} PolygonMANA\n (using your 1 time 50% discount)`
            } else {
                minting_message = `Mint 1 Compicactus, ${human_price} PolygonMANA\n (ask about a 50% discount on Discord)`
            }

            mint_prompt = true
            let prompt = new ui.OptionPrompt(
                `Minting a new Compicactus`,
                minting_message,
                async () => {
                    log(`Mint`)
                    minting = true
                    mint_prompt = false
                    const current_price = price
                    log("price", current_price);
                    clearMessages();
                    setStatus("Waiting for signature 1 of 2");
                    await network_compi.increaseAllowance(current_price[0]).then(receipt => {
                        if (receipt.status === 1) {
                            log("IncreaseAllowance Ok ", receipt)
                            setStatus("Waiting for signature 2 of 2");
                            network_compi.mintCompi(current_price[0]).then(receipt => {
                                if (receipt.status === 1) {
                                    log("Mint Ok ", receipt)
                                    showSuccess()
                                    setStatus("Compi minted!")
                                    updatePrice()
                                } else {
                                    log("Error on mint", receipt)
                                    showError()
                                    setStatus("Error minting")
                                    updatePrice()
                                }
                            }).catch(e => {
                                log("Error on mint", e)
                                showError()
                                setStatus("Error minting")
                                updatePrice()
                            })
                        } else {
                            log("Error on IncreaseAllowance", receipt)
                            setStatus("Error allowing MANA")
                            showError()
                        }
                    }).catch(e => {
                        log("Error on IncreaseAllowance", e)
                        setStatus("Error allowing MANA")
                        showError()
                    })
                },
                () => {
                    log(`Cancel`)
                    mint_prompt = false
                },
                'Mint',
                'Cancel'
            );
            prompt.closeIcon.onClick = new OnClick(()=>{
                prompt.close();
                mint_prompt = false
            });
        },
        {
            hoverText: "Mint Compi",
            button: ActionButton.POINTER
        })
    );

    // Price Text
    const price_shape = new TextShape()
    //price_shape.textWrapping = true
    price_shape.font = new Font(Fonts.SanFrancisco_Heavy)
    price_shape.hTextAlign = "left"
    price_shape.vTextAlign = "top"
    price_shape.fontSize = 4
    //price_shape.fontWeight = 'heavy'
    price_shape.value = "-"
    //price_shape.width = 1.5
    price_shape.color = new Color3(0.3, 0.05, 0.05)

    const price_entity = new Entity()
    price_entity.addComponent(price_shape)
    price_entity.addComponent(new Transform({
        position: new Vector3(5.9-8, 2.2-0.5, 0),
        rotation: Quaternion.Euler(0, 180, 0),
        //scale: new Vector3(0.5, 0.5, 1)
    }))
    price_entity.setParent(compi_train);

    // Status Text
    const status_shape = new TextShape()
    //price_shape.textWrapping = true
    status_shape.font = new Font(Fonts.SanFrancisco_Heavy)
    status_shape.hTextAlign = "left"
    status_shape.vTextAlign = "top"
    status_shape.fontSize = 1
    //price_shape.fontWeight = 'heavy'
    status_shape.value = "Status:\n-Idle"
    status_shape.color = Color3.White()

    const status_entity = new Entity()
    status_entity.addComponent(status_shape)
    status_entity.addComponent(new Transform({
        position: new Vector3(5.9-8, 1.2-0.5, 0),
        rotation: Quaternion.Euler(0, 180, 0),
        //scale: new Vector3(0.5, 0.5, 1)
    }))
    status_entity.setParent(compi_train);


    function updatePrice() {
        executeTask(async ()=>{
            price = await network_compi.getPrice()
            price_shape.value = network_compi.wei2human(price[0].toString())
            if (price[1]) {
                price_shape.value += "\n50% Off!"
            }
        })
    }

    function setStatus(text: string) {
        status_shape.value = `Status:\n-${text}`
    }

    updatePrice()


    function showError() {
        error_shape.visible = true
        clipError.looping = false
        clipError.play(true)
        success_shape.visible = false
        minting = false
    }

    function showSuccess() {
        success_shape.visible = true
        clipSuccess.looping = false
        clipSuccess.play(true)
        error_shape.visible = false
        minting = false
    }

    function clearMessages() {
        error_shape.visible = false
        success_shape.visible = false
    }



    // Set the date we're counting down to
    //var countDownDate = new Date("Oct 16, 2021 16:05:00").getTime();
    let countDownDate = Date.UTC(2022, 9, 16, 16, 5);
    log("date", countDownDate)
    executeTask(async ()=>{
        const _countDownDate = await network_compi.getTimeWindow()
        countDownDate = Number(_countDownDate[0])
    })

    class TimerSystem implements ISystem {
        acumulated_time: number = 0
        update(dt: number) {
            this.acumulated_time += dt;
            if (this.acumulated_time < 1) return;

            var now = new Date().getTime();
            //var now = Date.UTC(2020, 9, 16, 11, 10);

            var distance = countDownDate - now;

            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            let time_txt

            if (distance < 0) {
                time_txt = "Live!";
                engine.removeSystem(this)
            } else {
                time_txt = ` Starting in ${days}d ${hours}h ${minutes}m ${seconds}s`;
            }

            setStatus(time_txt)
        }
    }

    const timer_system = new TimerSystem()
    engine.addSystem(timer_system)

    /*
    let block_train = new Entity();
    block_train.addComponent(block_shape);
    block_train.addComponent(new Transform({
        position: new Vector3(42, 0.5, 24)
    }));
    block_train.setParent(compi_core);

    let comingsooncore_entity = new Entity();
    comingsooncore_entity.addComponent(new Transform({
        position: new Vector3(42, 0, 24)
    }));
    comingsooncore_entity.addComponent(new Billboard(false, true, false));
    comingsooncore_entity.setParent(compi_core);

    let comingsoon_entity = new Entity();
    let comingsoon_text = new TextShape();
    comingsoon_text.value = "Coming Soon!";
    comingsoon_text.font = new Font(Fonts.SanFrancisco_Heavy);
    comingsoon_text.fontSize = 2;
    comingsoon_text.color = Color3.Black();
    comingsoon_text.outlineColor = Color3.White();
    comingsoon_text.outlineWidth = 0.1
    comingsoon_entity.addComponent(comingsoon_text);
    comingsoon_entity.addComponent(new Transform({
        position: new Vector3(0, 2, 0.5),
        rotation: Quaternion.Euler(0, 180, 30),
        scale: new Vector3(1.5, 1.5, 1.5)
    }));
    comingsoon_entity.setParent(comingsooncore_entity);*/


    const r = {
        compi_faq: compi_faq,
        compi_train: compi_train,
        core: compi_core,
        timer_system: timer_system
    };

    compi = r;

    return r;
}
