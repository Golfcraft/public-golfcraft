import {createEyes} from './eyes';
import { createMouth } from "./mouth";
import {createHead} from "./head";
import {propertySizes, decode, properties, getEncoder, encode, maximumNumber } from '../lib/decoder';

const colors = [
    `#ff0000`,
    `#ff00ff`, 
    `#ffff00`,
    `#ffffff`,
    `#00ff00`,
    `#00ffff`,
    `#0000ff`,  
  ];

const texture = new Texture(`metas/voxters-pet/images/sprites2048.png`, {samplingMode:1, hasAlpha:true});
const skin = new Material();

export const createVoxter = (name:string, x:number, y:number, z:number, eyeIndex:number, mouthIndex:number, eyeColorIndex:number, headIndex:number) => {
    console.log("createVoxter")
    const callbacks:any = {
      onClick:null
    };
    const voxter = new Entity();   
    skin.albedoColor = new Color3(0,0,0);
    const boxterShape = new BoxShape();
    boxterShape.withCollisions = false;
    const label = new Entity();
    const labelText = new TextShape();
    label.addComponent(labelText);
    labelText.value = name;
    labelText.fontSize = 2;
    labelText.outlineColor = Color3.Black();
    labelText.outlineWidth = 0.2;
    labelText.font = new Font(Fonts.SanFrancisco_Heavy);
    labelText.billboard = true;
  
    labelText.color = Color3.FromHexString(colors[eyeColorIndex]);    
    label.setParent(voxter);
    label.addComponent(new Transform({position:new Vector3(0,1,0)}))
    voxter.addComponent(boxterShape);
    voxter.addComponent(skin);  
    
    const boxterTransform = new Transform({
      position:new Vector3(x,y,z),
      scale:new Vector3(0.5,0.5,0.5)
    });
    voxter.addComponent(boxterTransform);
    
    const eyes = createEyes(voxter, eyeIndex, colors[eyeColorIndex], texture);
    const mouth = createMouth(voxter, mouthIndex, `#ff00ff`, texture);
    const head = createHead(voxter, headIndex);
    
  /*   const dna = encode(
      [64,64,7,8],
      [eyeIndex,mouthIndex,eyeColorIndex,headIndex]
    );   */
  
    /* voxter.addComponent(new OnPointerDown(()=>{
       callbacks.onClick && callbacks.onClick();
    }));  */
    engine.addEntity(voxter);
    let hasClick = false;
    return {
      onClick:(fn:any)=>{
        if(!hasClick){
          hasClick = true;
          const entity = new Entity();
          const box =new BoxShape();
          box.withCollisions = false;
          box.isPointerBlocker = true;
          entity.addComponent(box);
          const material = new Material();
          entity.addComponent(material);
          entity.addComponent(new Transform({
            position: new Vector3(1,1,0),
            scale:new Vector3(4.5,3,0.5)
          }))
          material.albedoColor = new Color4(1,0,0,0);
          entity.setParent(voxter);

          entity.addComponent(new OnPointerDown(({buttonId, origin, direction, hit})=>{
              callbacks.onClick && callbacks.onClick(buttonId);
          }, {hoverText:"CLICK: switch E: change collection"}));
        }
        callbacks.onClick = fn;
      },
      applyDna:(dna:any)=>{
        const [eyeIndex, mouthIndex, colorIndex, headIndex] = decode(dna, propertySizes);        
        eyes.applyIndex(eyeIndex);
        eyes.applyColor(colors[colorIndex]);
        mouth.applyIndex(mouthIndex);             
        head.applyIndex(headIndex);
      },
      getEntity:()=>voxter,
      setPosition:(position:Vector3)=>{
        voxter.getComponent(Transform).position.copyFrom(position)
      },
     getPosition:()=>voxter.getComponent(Transform).position.clone(),
      dispose:()=>{
        voxter.setParent(null);
        engine.removeEntity(voxter);
      },
      lookAt:(target:Vector3)=>{
        voxter.getComponent(Transform).lookAt(target);
      },
      update:(dt:number)=>{

      },
        hide:()=>{
            voxter.setParent(null);
            engine.removeEntity(voxter);
        },
        show:()=>{
            engine.addEntity(voxter);
        }
    };
  };
