import {createGolfClub} from "./golf-club";
import {getTexture, getGLTFShape} from "../../../services/resource-repo";
import {createState} from "../../../../state";
type CreateShootControlOptions = {
    position:Vector3,
    rotation:Quaternion,
    aimLength:number,
    golfClubId:string,
    hideGolfclub?:boolean
};
const BAR_SIZE = 200;
const canvas = new UICanvas();
const powerUI = new UIContainerRect(canvas);
powerUI.color = new Color4(1,1,1,0.3)
powerUI.hAlign = "right";
powerUI.vAlign = "top";
powerUI.height = BAR_SIZE;
powerUI.width = 20;
powerUI.positionX = -20;
powerUI.positionY = -80;
powerUI.visible = false;
const powerUIValue = new UIContainerRect(powerUI);
powerUIValue.color = new Color4(0,0,1,1);
powerUIValue.width = 16;
powerUIValue.vAlign = "bottom";
powerUIValue.height = 2;
powerUIValue.positionY = 2;

const createShootControlVisual = (parent:Entity, {position, rotation = Quaternion.Zero(), aimLength, golfClubId, hideGolfclub}:CreateShootControlOptions) => {
    const baseUrl = (<any>engine)["__COURSE_MODELS_BASE__"]||"";
    const store = createState({
        powerMode:false
    });
    const state = store.getState();
    const shootTexture = getTexture(baseUrl+`images/shoot.png`);

    const aimingPowerGLTF = getGLTFShape(baseUrl+`models/aiming_power.gltf`);
    const aimingRotationGLTF = getGLTFShape(baseUrl+`models/aiming_rotation.gltf`);

    const MIN_SCALE = 0.3;
    const entity = new Entity();
    const rod = !hideGolfclub && createGolfClub(entity, {id:golfClubId});
    !hideGolfclub && rod.show();
    powerUI.visible = true;


    function getPowerUISize(value){
        return Math.max(2, BAR_SIZE * value / 100);
    }

    const shape = new BoxShape();
    shape.withCollisions = false;
    shape.isPointerBlocker= false;
    const material = new Material();
    material.albedoColor = Color4.Green();
    material.roughness = 1;
    // environmentIntensity is not a property of Material
    //material.environmentIntensity = 0;
    material.metallic = 0;
    material.alphaTexture = shootTexture;
    material.albedoTexture = shootTexture;
    const material2 = new Material();
    material2.albedoColor = new Color4(1,1,1,0.3)

    const scale100 = 4;
    const maxAimLength = 10;
    const scale = new Vector3(0.2, 0.01, scale100/2);
    entity.addComponent(new Transform({
        position,
        rotation
    }));

    const power = new Entity();
    power.addComponent(new Transform({
        position: new Vector3(0,0,scale.z/2),
        scale
    }));

    power.addComponent(shape);
    power.addComponent(material);
    power.setParent(entity);

    const aim = new Entity();
    aim.addComponent(new Transform({
        position: new Vector3(0, -0.01, (maxAimLength*aimLength/100)/2),
        scale:new Vector3(0.01, 0.01, maxAimLength*aimLength/100)
    }));

    aim.addComponent(shape);
    aim.addComponent(material2);
    aim.setParent(entity);

    const aimingPower = new Entity();
    aimingPower.addComponent(aimingPowerGLTF);
    aimingPower.setParent(entity);
    aimingPowerGLTF.visible = false;

    const aimingRotation = new Entity();
    aimingRotation.addComponent(aimingRotationGLTF);
    aimingRotation.setParent(entity);

    entity.setParent(parent);

    const offStore = store.onChange(({newValue, oldValue, prop})=>{
        if(prop === "powerMode"){
            if(newValue){
                //aimingRotation.setParent(null);
                //engine.removeEntity(aimingRotation);
                //aimingPower.setParent(entity);
                aimingPowerGLTF.visible = true;
                aimingRotationGLTF.visible = false;
            }else{
                //aimingPower.setParent(null);
                //engine.removeEntity(aimingPower);
                //aimingRotation.setParent(entity);
                aimingPowerGLTF.visible = false;
                aimingRotationGLTF.visible = true;
            }
        }
    });

    return {
        setAngle:(ry:number)=>{
            rotation.copyFrom(Quaternion.Euler(0,ry,0));
        },
        setPower:(value:number)=>{ //basis is 0-100
            scale.z = Math.min(MIN_SCALE + (value*scale100/100), scale100);
            power.getComponent(Transform).position.z = scale.z/2;
            if(value === 0){
                material.albedoColor = new Color4(0,0,1,1);
                powerUIValue.color.r = 0;
                powerUIValue.color.g = 0;
                powerUIValue.color.b = 1;
            }else{
                const {r,g,b} = getColorForPercentage(value/100);
                material.albedoColor = new Color4(r,g,b,1)

                powerUIValue.color.r = r;
                powerUIValue.color.g = g;
                powerUIValue.color.b = b;
            }
            powerUIValue.height = getPowerUISize(value);
        },
        dispose:()=>{
            entity.setParent(null);
            engine.removeEntity(entity);
            powerUI.visible = false;

            offStore();
        },
        hide:()=>{
            if(!shape.visible) return;
            shape.visible = false
            aimingPowerGLTF.visible = false
            aimingRotationGLTF.visible = false

            powerUI.visible = false;
        },
        show:()=>{
            if(shape.visible) return;
            shape.visible = true
            aimingPowerGLTF.visible = true
            aimingRotationGLTF.visible = true

            powerUI.visible = true;
        },
        setPosition:(position:any)=>{
            const {x,y,z} = position;
            entity.getComponent(Transform).position.set(x,y,z);
        },
        getPosition:()=>entity.getComponent(Transform).position,
        getEntity:()=>entity,
        shoot:()=>{
            !hideGolfclub && rod.reproduceAnimation("shoot1");
        },
        idle:()=>{
            !hideGolfclub && rod.reproduceAnimation("idle");
        },
        modeRotation:()=>{
            state.powerMode = false;
        },
        modePower:()=>{
            state.powerMode = true;
        }
    };
}

export {
    createShootControlVisual
};
var percentColors = [
    { pct: 0, color: { r: 0, g: 255, b: 0 } },
    { pct: 0.5, color: { r: 255, g: 255, b: 0 } },
    { pct: 1, color: { r: 255, g: 0, b: 0 } } ];

var getColorForPercentage = function(pct) {
    for (var i = 1; i < percentColors.length - 1; i++) {
        if (pct < percentColors[i].pct) {
            break;
        }
    }
    var lower = percentColors[i - 1];
    var upper = percentColors[i];
    var range = upper.pct - lower.pct;
    var rangePct = (pct - lower.pct) / range;
    var pctLower = 1 - rangePct;
    var pctUpper = rangePct;
    var color = {
        r: (lower.color.r * pctLower + upper.color.r * pctUpper)/255,
        g: (lower.color.g * pctLower + upper.color.g * pctUpper)/255,
        b: (lower.color.b * pctLower + upper.color.b * pctUpper)/255
    };
    return color;
    // or output as hex if preferred
};
