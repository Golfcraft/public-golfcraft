import { isExpressionWithTypeArguments } from "typescript";
import { callbackify } from "util";
import courseMockTrainingHole from "../../../common/course-definitions/courseMockTrainingHole";
import {createBoard} from "./board";
import {getTexture} from "./ui/ui-texture";

const createLinkBoard = (parent, {position, rotation, scale =  new Vector3(4, 2.7, 1), imageSrc, links, without3D = false, withAlpha })=>{
    const entity = new Entity();
    entity.setParent(parent);
    entity.addComponent(new Transform({
        position,
        rotation
    }));


    const plane = new Entity();
    const planeShape = new PlaneShape();
    plane.addComponent(planeShape);
    plane.addComponent(new Transform({
        scale:scale.multiply(new Vector3(-1,-1,-1)),
        position:new Vector3(0, 2.3, 0)
    }));
    const texture = getTexture(imageSrc);
    const material = new BasicMaterial();
    material.texture = texture;
    console.log("withAlpha",withAlpha, imageSrc)
    //if(withAlpha) material.alphaTexture = texture;
    //material.emissiveTexture = texture;
    if(!without3D){
        const board = createBoard(entity, {position:new Vector3(), rotation:new Quaternion()});
        board.setParent(entity);
        plane.addComponent(material);
    }else{
        plane.addComponent(material);
    }
    //material.emissiveIntensity = 1;
    //material.emissiveColor = Color3.White();//without3D ? Color3.White() : Color3.Yellow();
    plane.setParent(entity);
    const linkEntity =  new Entity();
    linkEntity.setParent(entity);
    linkEntity.addComponent(new Transform({position:new Vector3(0,0,-0.1)}));

    const linkEntities = links.map(({callback,url, position = new Vector3(0,2.4,-0.1), scale = new Vector3(4,3,1), hoverText})=>{
        const _entity = new Entity();
        const planeShape = new PlaneShape();
        
         const material = new Material();
        material.albedoColor = new Color4(1,0,0,0);
        _entity.addComponent(material); 

        _entity.addComponent(new Transform({
            position, scale
        }));
        _entity.addComponent(planeShape);
        const pointerComponent = new OnPointerDown(()=>{
            if(url) openExternalURL(url);
            if(callback) callback(pointerComponent)
        },{ hoverText: hoverText||url });

        _entity.addComponent( pointerComponent );
        _entity.setParent(linkEntity);
        return _entity;
    });

    return {
        getPointerComponent:(index)=>{
            return linkEntities[index].getComponent(OnPointerDown);
        }
    }

}

export {createLinkBoard};