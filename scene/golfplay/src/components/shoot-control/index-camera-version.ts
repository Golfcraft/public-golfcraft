import * as utils from '@dcl/ecs-scene-utils';
import {createShootControlVisual} from "./shoot-control-visual";
import {createState} from "../../../../state";
import { SHOOT_IMPULSE } from "../../../../../common/physics-config";
import { getRandom, getRandomInt } from "../../../../../common/utils";
import {getCanvas} from "../../../services/canvas";
import {createControlHint} from "./bottom-panel";
import {movePlayerTo} from "@decentraland/RestrictedActions";


type CreateShootControlOptions = {
    position:Vector3,
    rotation:Quaternion,
    golfclub:{
        power:number,
        control:number,
        aim:number,
        id:string
    },
    hideGolfclub?:boolean
};

type ShootControlState = {
    rotation:number,
    modifiedRotation:number,
    power:number,
    step:0|1|2,
    ePressed:boolean,
    fPressed:boolean,
    timePressed:number,
    VELOCITY:number
}
type UpdateEffectDefinition = {
    condition:(state:ShootControlState)=>boolean,
    effect:(state:ShootControlState, dt?:number)=>any
};

class UpdateSystem implements ISystem {
    private callback;
    constructor(callback){
        this.callback = callback;
        engine.addSystem(this);
    }
    update(dt:number){
        this.callback(dt);
    }
    dispose(){
        this.callback = null;
        engine.removeSystem(this);
    }
}

const controlHint = createControlHint();
const MIN_VELOCITY = 0.5;
const MAX_VELOCITY = 4;
const START_OF_DEVIANCE_BY_POWER = 40;
const MAX_DEGREES_DEVIANCE = 2;

const devianceFactorLevels = [1, 0.8, 0.6, 0.4, 0.2, 0];
const maxPowerByGolbclubLevel = [60, 70, 80, 90, 95, 100];
const aimLengths = [0, 20, 40, 60, 80, 100];


const createShootControl2 = (parent:Entity, {position, rotation, golfclub, hideGolfclub}:CreateShootControlOptions) => {
    var bottomPanelEnabled = true;
    var rotationEnabled = true;

    const store = createState({
        rotation:rotation.eulerAngles.y,
        power:50,
        step:1,
        ePressed:false,
        fPressed:false,
        n3Pressed:false,
        n4Pressed:false,
        visible:true,
        VELOCITY:MIN_VELOCITY
    });
    const state = store.getState();

    const callbacks = {
        onShoot:null,
        onFinishShootAnimation:null
    };

    Input.instance.subscribe("BUTTON_DOWN", ActionButton.PRIMARY, false, ePressedTrue);
    Input.instance.subscribe("BUTTON_UP", ActionButton.PRIMARY, false, ePressedFalse);
    Input.instance.subscribe("BUTTON_DOWN", ActionButton.SECONDARY, false, fPressedTrue);
    Input.instance.subscribe("BUTTON_UP", ActionButton.SECONDARY, false, fPressedFalse);
    Input.instance.subscribe("BUTTON_DOWN", ActionButton.POINTER, false, mouseDown);
 /*   Input.instance.subscribe("BUTTON_DOWN", ActionButton.ACTION_5, false, n3PressedTrue);
    Input.instance.subscribe("BUTTON_UP", ActionButton.ACTION_5, false, n3PressedFalse);
    Input.instance.subscribe("BUTTON_DOWN", ActionButton.ACTION_6, false, n4PressedTrue);
    Input.instance.subscribe("BUTTON_UP", ActionButton.ACTION_6, false, n4PressedFalse);*/

    const showBottomPanel = () => {
        if (bottomPanelEnabled) {
            controlHint.show();
        }
    }

    const control = createShootControlVisual(parent, {position, rotation, aimLength:aimLengths[golfclub?.aim || 0], golfClubId:golfclub.id, hideGolfclub});
    control.setPower(store.getState().power);
    const STEP0_MESSAGE = "E = Left\nF = Right\nCLICK = Set power";
    showBottomPanel();
    controlHint.setStep(0);
    const unsubscribeStoreChange = store.onChange(({newValue, oldValue, prop})=>{
        const {step, visible, rotation, modifiedRotation, power} = store.getState();
        control.setAngle(modifiedRotation);
        control.setPower(power);

        if(visible){
            control.show();
            showBottomPanel();
            if(step == 1){
                controlHint.setStep(0)
                control.modeRotation();
            }else if(step == 2){
                controlHint.setStep(1);
                control.modePower();
            }
        }else{
            control.hide();
            controlHint.hide();
        }
    });
    function getGlobalPosition(entity){
        return entity.getComponent(Transform).position.add(entity.getParent().getComponent(Transform).position);
    }
    const modArea = new Entity()
    modArea.addComponent(
        new AvatarModifierArea({
            area: { box: new Vector3(1000, 1000, 1000) },
            modifiers: [AvatarModifiers.HIDE_AVATARS],
        })
    )

    modArea.setParent(control.getEntity());
    /*    modArea.addComponent(
        new Transform({
            position: new Vector3(0, 0, 0),
        })
    )*/
    console.log("control.getEntity()",control.getEntity().getParent())
    console.log("control global position", getGlobalPosition(control.getEntity()))
    const logUI = new UIText(getCanvas());
    logUI.vAlign = "top";
    logUI.value = "FOOO"
    const difCameraControlY = 0.405 - 0.35;
     const update = (dt:number) => {
        const controlGlobalPosition = getGlobalPosition(control.getEntity());
        // movePlayerTo(controlGlobalPosition);
         const lerpResult = Vector3.Lerp(
             Camera.instance.feetPosition,
             controlGlobalPosition,
             dt
         );

        if(lerpResult.y > 0){
            movePlayerTo({x:lerpResult.x, y:0.405, z:lerpResult.z})
        }

 //        logUI.value = `${controlGlobalPosition.toString()}\n${Camera.instance.feetPosition}\n${lerpResult}`;
        //state.rotation = Camera.instance.rotation.eulerAngles.y||state.rotation ;
         state.rotation = Camera.instance.rotation.eulerAngles.y?Quaternion.Slerp(
             Quaternion.Euler(0,state.rotation,0),
             Camera.instance.rotation,
             dt*10
         ).eulerAngles.y:state.rotation;
       /* const localCameraPosition = Camera.instance.feetPosition
            .subtract(
                parent.getComponent(Transform).position
            );

        state.rotation = Quaternion.Slerp(
            Quaternion.Euler(0,state.rotation,0),
            Quaternion.LookRotation(control.getPosition().subtract(localCameraPosition)),
            dt*2
        ).eulerAngles.y;*/


        if( XOR(state.ePressed, state.fPressed )) {
                state.VELOCITY = Math.min(MAX_VELOCITY, state.VELOCITY + dt * 2);
            }
            if (state.power > START_OF_DEVIANCE_BY_POWER) {
                const deviance = devianceFactorLevels[golfclub.control] * (MAX_DEGREES_DEVIANCE * (state.power - START_OF_DEVIANCE_BY_POWER) / (100 - START_OF_DEVIANCE_BY_POWER));
                state.modifiedRotation = state.rotation + (deviance && getRandom(-deviance, deviance) || 0);
            } else {
                state.modifiedRotation = state.rotation;
            }

            updateEffects.forEach(effectDefinition =>
                effectDefinition.condition(state)
                && store.setState(effectDefinition.effect(state, dt))
            );

    };

    const updateEffects:UpdateEffectDefinition[] = [
        {
            condition:(state) => !state.ePressed && !state.fPressed,
            effect:() => state.VELOCITY = MIN_VELOCITY
        },
        {
            condition:(state)=> state.ePressed && !state.fPressed,
            effect:(state)=>({ power: Math.min(maxPowerByGolbclubLevel[golfclub?.power||0], state.power+state.VELOCITY*1.5)})
        },
        {
            condition:(state)=> !state.ePressed && state.fPressed,
            effect:(state)=>({ power: Math.max(0, state.power-state.VELOCITY*1.5)})
        }
    ]

    new UpdateSystem(update);


    return {
        enable:()=>{},
        disable:()=>{},
        show:()=>{
            if (rotationEnabled) {
                state.step = 1;
            } else {
                state.ePressed = false;
                state.fPressed = false;
                state.step = 2;
            }

            store.getState().visible = true;
        },
        hide:()=>{
            store.getState().visible = false;
        },
        disableBottomPanel: ()=>{
            controlHint.hide();
            bottomPanelEnabled = false;
        },
        disableRotation: (_disable: boolean)=>{
            rotationEnabled = !_disable;

            if (rotationEnabled) {
                store.setState({ step: 1})
            } else {
                store.setState({ step: 2})
            }
        },
        setPower: (_power: number)=>{
            store.setState({ power: _power})
        },
        dispose:()=>{
            unsubscribeStoreChange();
            store.getState().visible = false;
            callbacks.onShoot = null;
            callbacks.onFinishShootAnimation = null;
            Input.instance.unsubscribe("BUTTON_DOWN", ActionButton.PRIMARY, ePressedTrue);
            Input.instance.unsubscribe("BUTTON_UP", ActionButton.PRIMARY, ePressedFalse);
            Input.instance.unsubscribe("BUTTON_DOWN", ActionButton.SECONDARY, fPressedTrue);
            Input.instance.unsubscribe("BUTTON_UP", ActionButton.SECONDARY, fPressedFalse);
            Input.instance.unsubscribe("BUTTON_DOWN", ActionButton.POINTER, mouseDown);
            controlHint.hide();
            control.dispose();
        },
        onShoot:(fn:any)=>{
            callbacks.onShoot = fn;
            return () => callbacks.onShoot = null;
        },
        setPosition:(position:any)=>{
            control.setPosition(position);
        },
        getEntity:()=>control.getEntity(),
        onFinishShootAnimation:(fn)=>{
            callbacks.onFinishShootAnimation = fn;
            return () => callbacks.onFinishShootAnimation = null;
        }
    };

    function ePressedTrue(){
        if(!state.fPressed){
            state.timePressed = Date.now();
        }
        store.setState({
            ePressed:true
        });
    }
    function ePressedFalse(){
        if(!state.fPressed){
            state.timePressed = 0;
        }
        store.setState({
            ePressed:false
        });
    }
    function fPressedTrue(){
        store.setState({
            fPressed:true
        });
    }
    function fPressedFalse(){
        store.setState({
            fPressed:false
        });
    }
    function n3PressedTrue(){
        store.setState({
            n3Pressed:true
        });
    }
    function n3PressedFalse(){
        store.setState({
            n3Pressed:false
        });
    }
    function n4PressedTrue(){
        store.setState({
            n4Pressed:true
        });
    }
    function n4PressedFalse(){
        store.setState({
            n4Pressed:false
        });
    }
    function mouseDown (event) {
        const state = store.getState();
        if(state.step == 1){
            control.idle();
            state.step = 2;
            state.ePressed = false;
            state.fPressed = false;
        }else if(state.step === 2 && state.visible && state.power){
            const delayMs = 400;//golfclub animation, can vary animation/power/time
            control.shoot();
            callbacks.onShoot && callbacks.onShoot({impulse:getImpulseVectorFromState(state), delayMs});
            !hideGolfclub && utils.setTimeout(delayMs, () => {
                callbacks.onFinishShootAnimation && callbacks.onFinishShootAnimation();
                control.idle();
            });//TODO maybe should consider lastPing
            if (rotationEnabled) {
                state.step = 1;
            } else {
                state.step = 2;
            }
        }
    }
}

export {
    createShootControl2
};

function getImpulseVectorFromState(state:ShootControlState){
    const radians = state.modifiedRotation * Math.PI / 180
    const y = 0;
    const x = Math.sin(radians) * (state.power/100) * 2;
    const z = Math.cos(radians) * (state.power/100) * 2;
    return new Vector3(x,y,z).multiply(new Vector3(SHOOT_IMPULSE,SHOOT_IMPULSE,SHOOT_IMPULSE));
}

function XOR(a, b){
    return ( a && !b ) || ( !a && b );
}
