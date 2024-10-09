import * as utils from '@dcl/ecs-scene-utils';
import {createShootControlVisual} from "./shoot-control-visual";
import {createState} from "../../../../state";
import { SHOOT_IMPULSE } from "../../../../../common/physics-config";
import { getRandom, getRandomInt } from "../../../../../common/utils";
import {getCanvas} from "../../../services/canvas";
import {createControlHint} from "./bottom-panel";

declare const console;
type CreateShootControlOptions = {
    position:Vector3,
    rotation:Quaternion,
    golfclub:{
        power:number,
        control:number,
        aim:number,
        id:string
    },
    hideGolfclub?:boolean,
    currentGame?:any//TODO remove
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


const createShootControl = (parent:Entity, {position, rotation, golfclub, hideGolfclub, currentGame}:CreateShootControlOptions) => {
    const _innerState = {
        rotationEnabled:true,
        bottomPanelEnabled:true
    }
    console.log("creating shoot control", currentGame);
    const store = createState({
        _id:Date.now(),
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
        if (_innerState.bottomPanelEnabled) {
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

    const update = (dt:number) => {
        const state = store.getState();

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
            condition:(state)=>state.step === 1 && state.ePressed && !state.fPressed,
            effect:(state, dt)=>({ rotation: state.rotation - state.VELOCITY})
        },
        {
            condition:(state)=>state.step === 1 && !state.ePressed && state.fPressed,
            effect:(state, dt)=>({ rotation: state.rotation + state.VELOCITY})
        },
        {
            condition:(state)=>state.step === 2 && state.ePressed && !state.fPressed,
            effect:(state)=>({ power: Math.min(maxPowerByGolbclubLevel[golfclub?.power||0], state.power+state.VELOCITY*1.5)})
        },
        {
            condition:(state)=>state.step === 2 && !state.ePressed && state.fPressed,
            effect:(state)=>({ power: Math.max(0, state.power-state.VELOCITY*1.5)})
        },
        {
            condition:(state)=>state.step === 2 && state.ePressed && state.fPressed,
            effect:(state)=>{
                if (!_innerState.rotationEnabled) return;
                return { step: 1}
            }
        }
    ]

    const updateSystem = new UpdateSystem(update);

    return {
        enable:()=>{},
        disable:()=>{},
        show:()=>{
            console.log("control show", JSON.stringify(state), currentGame)
            if (_innerState.rotationEnabled) {
                state.step = 1;
            } else {
                state.ePressed = false;
                state.fPressed = false;
                state.step = 2;
            }

            store.getState().visible = true;
        },
        hide:()=>{
            console.log("control hide", JSON.stringify(state), currentGame)
            store.getState().visible = false;
        },
        disableBottomPanel: ()=>{
            controlHint.hide();
            _innerState.bottomPanelEnabled = false;
        },
        disableRotation: (_disable: boolean)=>{
            _innerState.rotationEnabled = !_disable;

            if (_innerState.rotationEnabled) {
                store.setState({ step: 1})
            } else {
                store.setState({ step: 2})
            }
        },
        setPower: (_power: number)=>{
            store.setState({ power: _power})
        },
        dispose:()=>{
            console.log("control dispose", JSON.stringify(store.getState()));
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
            updateSystem.dispose();
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
        console.log("mouseDown", JSON.stringify(state));
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
                control.idle(); //TODO REVIEW -> it should not idle on finish animation but when ball is sleep ?
            });//TODO maybe should consider lastPing
            if (_innerState.rotationEnabled) {
                state.step = 1;
            } else {
                state.step = 2;
            }
        }
    }
}

export {
    createShootControl
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
