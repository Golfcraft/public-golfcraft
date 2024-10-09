import {getEditorStore, setEditorStore} from "./editor-store";
import { signedFetch } from '@decentraland/SignedFetch';
import {defaultEmissive} from "../emissive-image";

type CourseExpressions = {
    assignments:{
        [key:string]:{
            expression:string
        }
    }
}
type PartInstanceDefinition = {
    expressions?:{
        runtime?:{[attribute:string]:string},
        physics?:{
            force?:number
        },
    },
    id:number,
    position:number[],
    rotation:number[],
    scale:number[],
    subtype:string,
    type:"solid"|"magnet"|"initial_position"|"hole"|"spawn"|"explosive"
}
type CourseDefinition = {
    parts:PartInstanceDefinition[],
    expressions?:CourseExpressions
}

type EditorState = {
    definition:CourseDefinition,
    selectedPartId:number,
    editorMode:number//1=camera,select;2=move;3=rotate;4=add,duplicate
}
@Component("HandlerBox")
class HandlerBox {
}
import {createState} from "../../../state";
import {AvatarMovement} from "./avatar-move-system";
import {createPartHandler} from "./part-handler";
import {createEditorUI} from "./editor-ui";
import {getPartsData, loadParts} from "./parts-repository";
import {getGLTFShape, getTexture} from "../../services/resource-repo";
import {DEFAULT_DEFINITION, DEFAULT_DEFINITIONS} from "./default-definition";
import {createSavePanel} from "./save-panel";
import {USE_REMOTE_SERVER} from "../../../../common/constants";
import {partsWithHole} from "./hole-part-registry";
import {globalStore} from "../../../src/services/globalStore/globalStore";
import {getPartIdFromShapeInstanceId} from "./editor-util";
import {ImagePart, TextPart} from "../components/course/visual-part";
import {showMessage} from "../../../src/components/server-notification";
import {getWalletParts} from "../../../src/services/parts-wallet-mock";
import {sleep, tryFn} from "../../../../common/utils";
import {createPropertiesPanel} from "./properties-panel";
const partShapeCatalog = {
    "Start1":"../scene/golfplay/models/Start1.gltf"
};
enum EDITOR_MODE {
    SELECT,
    EDIT,
    SHAPE,
}
enum EDITOR_EDIT_MODE {
    NONE,
    ROTATE,
    MOVE,
}
const DEFAULT_METADATA = {duration:120, GC:0, XP:0, minLevel:1};
const TEXT_BOX_MATERIAL = new Material();
TEXT_BOX_MATERIAL.albedoColor = new Color4(1,1,1,0.1);
const createEditor = async (_parent:Entity, {courseName, courseID, definition, metadata, wipParts = false, disableSave, collectionId}:{collectionId?:number, metadata?:any, courseName?:string, courseID?:number, definition?:CourseDefinition, wipParts?:boolean, disableSave?:boolean}) => {
    const baseUrl = (<any>engine)["__COURSE_MODELS_BASE__"]||"";
    const callbacks = {
        onExit:null
    }
    collectionId = !collectionId ? 0 : collectionId
    const entity = new Entity();
    entity.setParent(_parent);
    await loadParts(wipParts);
    const walletParts = await getWalletParts();
    const defaultDefinition = DEFAULT_DEFINITIONS[collectionId];
    const editorStore = createState({
        courseName:courseName||null,
        courseID:courseID||null,
        walletParts,
        isNew:!courseID,//TODO
        lockEntityY:-0.5,
        lockEntityY2:1.75,
        metadataDuration:metadata?.duration || 300,
        snapMove:1,
        snapRotate:45,
        loading:false,
        definition:{...(definition||defaultDefinition), parts:(definition||defaultDefinition).parts.filter(p=>p.type !== "hole").map(p=>{
            return {
                id:p.id,
                partId:p.subtype,
                store:createState(p),
                entity:new Entity(`part-${p.id}`)
            }
            })},//TODO each part be a store?
        selectedPartId:(definition||defaultDefinition).parts[0].id,
        editorMode:EDITOR_MODE.SELECT,
        editorEditMode:EDITOR_EDIT_MODE.MOVE,
    });
    const editorState = editorStore.getState();

    setEditorStore(editorStore);
    const savePanel = createSavePanel();
    const propertiesPanel = createPropertiesPanel();
    savePanel.onExit(()=>{
        entity.setParent(null);
        engine.removeEntity(entity);
        //TODO remove all ?
        callbacks.onExit && callbacks.onExit();
    })
    savePanel.onClick(async (value)=>{
        if(value === "RESET"){
            //TODO REVIEW refactor to savePanel.onReset?
            selectMode();

            await sleep(100);
            editorState.definition.parts.forEach((part)=>{
                part.entity.setParent(null);
                engine.removeEntity(part.entity);
            })
            propertiesPanel.enable(false);

            Object.assign(editorState, {
                definition:{
                    ...(defaultDefinition),
                    parts:(defaultDefinition).parts.filter(p=>p.type !== "hole").map(p=>{
                        return {
                            id:p.id,
                            partId:p.subtype,
                            store:createState(p),
                            entity:new Entity(`part-${p.id}`)
                        }
                    }),
                    expressions:{assignments:{},initialAssignments:{}}
                },
                selectedPartId:(defaultDefinition).parts[0].id,
                editorMode:EDITOR_MODE.SELECT,
                editorEditMode:EDITOR_EDIT_MODE.MOVE,
                loading:false,
            });

            editorState.definition.parts.forEach((partModel:any)=>{
                const part = partModel.store.getState();
                if(part.type === "solid"){
                    createPartEntity(partModel);
                }else if(part.type === "initial_position"){
                    createBallEntity(partModel);
                }else if(part.type === "spawn"){
                    createAvatarDollEntity(partModel);
                }else if(part.type === "image"){
                    createImagePartEntity(partModel);
                }else if(part.type === "text"){
                    createTextPartEntity(partModel);
                }
            });
            selectMode();
            editorUI.select("initial_position");


            adaptHandlerToPartAlias("initial_position");
            handler.setTarget(definition.parts[0].entity);
            propertiesPanel.enable(true);
            return;
        }

        //TODO add hole part for each part that is a hole

        const serializedDefinition = addHolesToDefinition(serializeDefinition(editorState));
        console.log("serializedDefinition", editorState, serializedDefinition);
        if(!editorState.courseName) return;
        const address = globalStore?.userData?.getState()?.userId || "admin-editor";
        const saveData = {
            alias:editorState.courseName,
            metadata:{...DEFAULT_METADATA, duration:editorState.metadataDuration},
            definition:serializedDefinition,
            mode:"competition",
            subType:"1",
            address,//TODO add signature and address
            authorName:globalStore?.userData?.getState()?.user?.displayName?.slice(0,40) || null
        };
        if(disableSave) {
            console.log("saveData",saveData);
            return;
        }
        editorState.loading = true;
        const baseAPIURL = USE_REMOTE_SERVER?`https://golfcraftgame.com`:`http://localhost:2569`;

        var fetchMethod;
        var fetchBody;
        if (editorState.isNew) {
            fetchMethod = "POST"
            fetchBody = {...saveData, displayName:saveData.alias, collectionId}
        } else {
            fetchMethod = "PUT"
            fetchBody = {
                ID:editorState.courseID,
                //alias:editorState.courseName,
                displayName:editorState.courseName,
                metadata:{...DEFAULT_METADATA, duration:editorState.metadataDuration},
                definition:serializedDefinition,
                address,//TODO add signature and address
            }
        }

        try{
            console.log("fetchMethod",fetchMethod, editorState);
            console.log("fetchBody",fetchBody, editorState);
            await signedFetch(`${baseAPIURL}/api/editor-course`, {
                method:fetchMethod,
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify(fetchBody)
            }).then(async (res)=>{
                if(!res.ok){
                    //const body = tryFn(()=>JSON.parse(res.text), ()=>res.json||res.text);
                    const json_parse = tryFn(()=>JSON.parse(res.text), ()=>undefined);
                    var message;
                    if (json_parse) {
                        message = getErrorMessageFromResult(json_parse)
                    } else{
                        message = res.text||"Request validation problem";
                    }
                    return handlesaveError({message});
                }
                const result = JSON.parse(res.text);
                if(result?.error) throw Error(getErrorMessageFromResult(result));
                if (editorState.isNew) {
                    // This if may not be needed
                    editorState.courseID = result.ID;
                }
                editorState.isNew = false;
                editorState.loading = false;
                savePanel.notify({text:"SAVE successful", color:Color3.Green()})
                return result;
            },handlesaveError);
        }catch(err){
            handlesaveError(err)
        }
        /*
        if(editorState.isNew){
            try{
                await signedFetch(`${baseAPIURL}/api/editor-course`, {
                    method:"POST",
                    headers:{"Content-Type":"application/json"},
                    body:JSON.stringify({...saveData, displayName:saveData.alias, collectionId})
                }).then(async (res)=>{
                    if(!res.ok){
                        const body = tryFn(()=>JSON.parse(res.text), ()=>res.json||res.text);
                        const message = body || "Request validation problem";
                        return handlesaveError({message});
                    }
                    const result = JSON.parse(res.text);
                    if(result?.error) throw Error(getErrorMessageFromResult(result));
                    editorState.isNew = false;
                    editorState.loading = false;
                    editorState.courseID = result.ID;
                    savePanel.notify({text:"SAVE successful", color:Color3.Green()})
                    return result;
                },handlesaveError);
            }catch(err){
                handlesaveError(err)
            }
        }else{
            try {
                await signedFetch(`${baseAPIURL}/api/editor-course`, {
                    method:"PUT",
                    headers:{"Content-Type":"application/json"},
                    body:JSON.stringify({
                        ID:editorState.courseID,
                        //alias:editorState.courseName,
                        displayName:editorState.courseName,
                        metadata:{...DEFAULT_METADATA, duration:editorState.metadataDuration},
                        definition:serializedDefinition,
                        address,//TODO add signature and address
                    })
                }).then(async (res)=>{
                    if(!res.ok){
                        const body = tryFn(()=>JSON.parse(res.text), ()=>res.json||res.text);
                        const message = body?.error || "Request validation problem";
                        return handlesaveError({message});
                    }
                    const result = JSON.parse(res.text);
                    if(result?.error) throw Error(getErrorMessageFromResult(result));
                    editorState.isNew = false;
                    editorState.loading = false;
                    savePanel.notify({text:"SAVE successful", color:Color3.Green()})
                }, handlesaveError);
            }catch(err){
                handlesaveError(err);
            }
        }*/

        function addHolesToDefinition(definition){
            const holeParts = [];
            definition.parts.forEach((part)=>{
                if(partsWithHole[part.subtype]){
                    const newHole = {
                        id:getMaxIdFromParts(definition.parts)+1,
                        type:"hole",
                        subtype:"",
                        scale:[1,1,1],
                        rotation:[0,0,0,0],
                        position: part.position.map((partPositionValue, index) => partPositionValue + partsWithHole[part.subtype][index])
                    };
                    holeParts.push(newHole);
                }else{

                }
            });
            definition.parts = definition.parts.concat(holeParts);
            return definition;

            function getMaxIdFromParts(parts){
                return parts.reduce((acc, part)=>{
                    return Math.max(acc, part.id);
                },2)
            }
        }
    });

    editorState.definition.parts.forEach((partModel:any)=>{
        const part = partModel.store.getState();
        if(part.type === "solid"){
            createPartEntity(partModel);
        }else if(part.type === "initial_position"){
            createBallEntity(partModel);
        }else if(part.type === "spawn"){
            createAvatarDollEntity(partModel);
        }else if(part.type === "image"){
            createImagePartEntity(partModel);
        }else if(part.type === "text"){
            createTextPartEntity(partModel)
        }
    });

    const editorUI = createEditorUI(collectionId, wipParts);

    editorUI.onDelete(()=>{
        if(editorState.definition.parts.filter(p=>p.store.getState().type === "solid").length <= 1) return;
        const newDefinition = {...editorState.definition};
        const partToDelete = newDefinition.parts.find(p=>p.id==editorState.selectedPartId) ;
        const currentPartIndex = newDefinition.parts.indexOf( partToDelete );

        partToDelete.entity.setParent(null);
        engine.removeEntity(partToDelete.entity);
        selectMode();
        handler.setTarget(newDefinition.parts[0].entity);
        newDefinition.parts.splice(currentPartIndex,1);
        editorState.selectedPartId = newDefinition.parts[0].id;
        editorState.definition = newDefinition;
        const newSelectionAlias =getPartIdFromShapeInstanceId(editorState.selectedPartId)
        editorUI.select(newSelectionAlias);
        adaptHandlerToPartAlias(newSelectionAlias);
    });
    editorUI.select(getPartIdFromShapeInstanceId(editorState.selectedPartId));

    editorUI.onChangeShape(({alias})=>{
        const oldAlias = getPartIdFromShapeInstanceId( editorState.selectedPartId);

        if(alias === oldAlias) return;
        const selectedPartModel = editorState.definition.parts.find(p=>p.id === editorState.selectedPartId);

        selectedPartModel.partId = alias;//TODO partId is redundant, to refactor remove it and just read from state.subtype
        selectedPartModel.store.getState().subtype = alias;
        removeHandlerBox(selectedPartModel);

        if(alias === "image" ) {
            selectedPartModel.entity.removeComponent(GLTFShape);
            selectedPartModel.store.getState().type = "image";
            selectedPartModel.store.getState().expressions = {
                image: {
                    url: "https://bafkreiejxrfujgij563xwcw2gmmpoz44umrpgzcq4v7jgz4obiczvdnxe4.ipfs.nftstorage.link",
                    width:4,
                    height:3
                }
            };
            createInnerImage(selectedPartModel.store.getState(), selectedPartModel.entity, getPartCallback(selectedPartModel));
        }else if(alias === "text"){
            selectedPartModel.entity.removeComponent(GLTFShape);
            selectedPartModel.store.getState().type = "text";
            selectedPartModel.store.getState().expressions = {
                text: {value: "text"}
            };
            createInnerText(selectedPartModel.store.getState(), selectedPartModel.entity);
            selectedPartModel.entity.addComponentOrReplace(new BoxShape());
            selectedPartModel.entity.addComponentOrReplace(TEXT_BOX_MATERIAL);

        }else{
            selectedPartModel.entity.addComponentOrReplace(getGLTFShape(baseUrl+`models/${alias}.gltf`));
            if(selectedPartModel.store.getState().subtype.indexOf("_area") >= 0){
                attachHandlerBox(selectedPartModel)
            }
        }
        if(oldAlias === "image"){
            const childWithImage = Object.values(selectedPartModel.entity.children).find(c=>c.getComponent(ImagePart));
            childWithImage.setParent(null);
            engine.removeEntity(childWithImage);
            selectedPartModel.entity.addComponent(new OnPointerDown(getPartCallback(selectedPartModel), {hoverText:"select"}));
        }else if(oldAlias === "text"){
            const childWithText = Object.values(selectedPartModel.entity.children).find(c=>c.getComponent(TextPart));
            childWithText.setParent(null);
            engine.removeEntity(childWithText);
            selectedPartModel.entity.removeComponent(Material);
        }
        editorUI.select(alias);
        adaptHandlerToPartAlias(alias);
        editorState.definition = {...editorState.definition};
    });

    const avatarLock = new AvatarMovement();
    engine.addSystem(avatarLock);

    const handler = createPartHandler(editorState.definition.parts[0].entity);
    handler.onChangeMode((editorMode)=>{
        editorState.editorEditMode = editorMode;
    });
    handler.disable();
    handler.onChangePosition((positions)=>{
        const partModel = editorStore.getState().definition.parts.find(i=>i.id === editorState.selectedPartId);
        partModel.store.getState().position = positions;
        partModel.entity.getComponent(Transform).position.set(...positions);
    });
    handler.onChangeRotation((rotations)=>{
        const partModel = editorStore.getState().definition.parts.find(i=>i.id === editorState.selectedPartId);
        partModel.store.getState().rotation = rotations;
        partModel.entity.getComponent(Transform).rotation.set(...rotations);
    });
    handler.show();

    const key2Handler = ()=>{
        if(editorState.editorMode === EDITOR_MODE.EDIT) return;
        editMode();
    }
    const key1Handler = () => selectMode();
    const key3Handler = ()=>{
        if(editorState.selectedPartId === 0 || editorState.selectedPartId === 1) return;
        if(!avatarLock.locked){
            avatarLock.lock();
        }
        handler.disable();
        editorState.editorMode = EDITOR_MODE.SHAPE;
    };
    const key4Handler = ()=>{
        if(editorState.selectedPartId === 0 || editorState.selectedPartId === 1) return;
        const currentPartModel = editorState.definition.parts.find(p=>p.id === editorState.selectedPartId);
        const newId = editorState.definition.parts.reduce((acc,partModel) => Math.max(acc, partModel.id), -1) + 1;
        const newPartModel = {
            id:newId,
            partId:currentPartModel.partId,
            store:createState(JSON.parse(JSON.stringify(currentPartModel.store.getState()))),
            entity:new Entity(`part-${newId}`)
        };
        if(newPartModel.partId === "image"){
            createInnerImage(newPartModel.store.getState(), newPartModel.entity, getPartCallback(newPartModel));
        }else if(newPartModel.partId === "text"){
            createInnerText(newPartModel.store.getState(), newPartModel.entity);
        }
        newPartModel.store.getState().id = newId;
        const newDefinition = {...editorState.definition};
        newDefinition.parts.push(newPartModel);
        editorState.definition = newDefinition;
        editorState.selectedPartId = newId;
        editorUI.select(getPartIdFromShapeInstanceId(newId))
        createPartEntity(newPartModel);
        handler.setTarget(newPartModel.entity);
        editMode();
        showMessage({timeout:2000, message:"Duplicated, move with WASDEF"})
    }

    Input.instance.subscribe("BUTTON_DOWN", ActionButton.ACTION_3, false, key1Handler);
    Input.instance.subscribe("BUTTON_DOWN", ActionButton.ACTION_4, false, key2Handler);
    Input.instance.subscribe("BUTTON_DOWN", ActionButton.ACTION_5, false, key3Handler);
    Input.instance.subscribe("BUTTON_DOWN", ActionButton.ACTION_6, false, key4Handler);

    return {
        dispose:()=>{
            //TODO remove listeners, etc.
            callbacks.onExit = null;
            Input.instance.unsubscribe("BUTTON_DOWN", ActionButton.ACTION_3, key1Handler);
            Input.instance.unsubscribe("BUTTON_DOWN", ActionButton.ACTION_4, key2Handler);
            Input.instance.unsubscribe("BUTTON_DOWN", ActionButton.ACTION_5, key3Handler);
            Input.instance.unsubscribe("BUTTON_DOWN", ActionButton.ACTION_6, key4Handler);
            avatarLock.dispose();
            handler.dispose();
            editorUI.hide();
            savePanel.hide();
            propertiesPanel.hide();
        },
        onExit:(fn)=>{
            callbacks.onExit = fn;
        }
    };

    function getErrorMessageFromResult(result){
        if(result?.error?.meta?.target === "alias_UNIQUE"){
            return "<br>Name is already used,<br>try another course name";
        }else{
            return "Save error: " + (result?.error?.message || result?.error || "")
        }
    }
    function handlesaveError(err){
        editorState.loading = false;
        savePanel.notify({text:err.message, color:Color3.Red()})
    }
    function serializeDefinition(editorState){
        return {
            parts:editorState.definition.parts.map((part)=>part.store.getState()),
            expressions:editorState.definition.expressions||undefined
        };
    }
    function getPartCallback(partModel){
        return ()=>{
            editorState.selectedPartId = partModel.id;
            const partAlias = getPartIdFromShapeInstanceId(editorState.selectedPartId);

            editorUI.select(partAlias);
            handler.setTarget(partModel.entity);
            adaptHandlerToPartAlias(partAlias);
        }
    }
    function createAvatarDollEntity(partModel){
        const part = partModel.store.getState();
        partModel.entity.addComponent(new Transform({
            position:new Vector3(...part.position),
            rotation:new Quaternion(...part.rotation),
            scale:new Vector3(1,1,1)
        }));
        partModel.entity.setParent(entity);
        const shape = new BoxShape();

        partModel.entity.addComponent(shape);
        partModel.entity.addComponent(new OnPointerDown(getPartCallback(partModel), {hoverText:"select", distance:9999, button:ActionButton.POINTER}));
    }
    function createBallEntity(partModel){
        const part = partModel.store.getState();
        partModel.entity.addComponent(new Transform({
            position:new Vector3(...part.position),
            rotation:new Quaternion(...part.rotation),
            scale:new Vector3(0.1,0.1,0.1)
        }));

        partModel.entity.setParent(entity);
        const shape = new SphereShape();
        const ballMaterial = new Material();
        ballMaterial.albedoColor = Color4.Magenta();

        Object.assign(ballMaterial, defaultEmissive);
        ballMaterial.emissiveIntensity = 0.6;

        partModel.entity.addComponent(shape);
        partModel.entity.addComponent(ballMaterial);

        partModel.entity.addComponent(new OnPointerDown(getPartCallback(partModel), {hoverText:"select", distance:9999, button:ActionButton.POINTER}));

        const direction_entity = new Entity();
        direction_entity.addComponent(new BoxShape());
        direction_entity.addComponent(new Transform({
            position: new Vector3(0, 0, 2),
            scale: new Vector3(0.7, 0.7, 3)
        }))
        direction_entity.setParent(partModel.entity);
    }
    function createPartEntity(partModel){
        const part = partModel.store.getState();
        partModel.entity.addComponent(new Transform({
            position:new Vector3(...part.position),
            rotation:new Quaternion(...part.rotation)
        }));
        partModel.entity.setParent(entity);
        const shape = getGLTFShape(baseUrl+`models/${part.subtype}.gltf`);
        partModel.entity.addComponent(shape);

        if(part.subtype.toLowerCase().indexOf("skybox") === -1){//not skybox
            partModel.entity.addComponent(new OnPointerDown(getPartCallback(partModel), {hoverText:"select", distance:9999, button:ActionButton.POINTER}));

            if(part.subtype.indexOf("_area") >= 0){
                console.log("attachHandlerBox partModel.entity",partModel.entity);
                attachHandlerBox(partModel);
            }
        }
    }

    function removeHandlerBox(partModel){
        const children = partModel?.entity?.children && Object.values(partModel?.entity?.children) ||[];
        const childWithHandlerBox = children.find(e => e.getComponentOrNull(HandlerBox));
        if(childWithHandlerBox){
            childWithHandlerBox.setParent(null);
            engine.removeEntity(childWithHandlerBox);
        }
    }

    function attachHandlerBox(partModel){
        //TODO REVIEW: WORKAROUND, this shape without collider, before, it was able to receive OnPointerDown. Now it is not.
        const handlerBox = new Entity();
        const handlerShape = new BoxShape();
        handlerBox.addComponent(handlerShape);
        const material = new Material();
        material.albedoColor = new Color4(1,1,0,0.1);
        handlerBox.addComponent(material);
        handlerBox.addComponent(new Transform({
            scale:new Vector3(4,0.25,4),
            position:new Vector3(0,0.25,0)
        }));
        handlerBox.addComponent(new HandlerBox());
        handlerBox.addComponent(new OnPointerDown(getPartCallback(partModel)))
        handlerBox.setParent(partModel.entity);
    }

    function createTextPartEntity(partModel){
        const part = partModel.store.getState();
        partModel.entity.addComponent(new Transform({
            position:new Vector3(...part.position),
            rotation:new Quaternion(...part.rotation),
        }));
        partModel.entity.setParent(entity);

        partModel.entity.addComponent(TEXT_BOX_MATERIAL);
        partModel.entity.addComponent(new BoxShape());
        partModel.entity.addComponent(new OnPointerDown(getPartCallback(partModel), {hoverText:"select", distance:9999, button:ActionButton.POINTER}));
        createInnerText(part, partModel.entity)
    }

    function createInnerText(part, entity){
        const textEntity = new Entity();
        const textShape= new TextShape();
        textEntity.addComponent(new TextPart());
        textEntity.addComponent(textShape);
        textShape.value = part?.expressions?.text?.value || "TEXT";
        textEntity.setParent(entity);
        getEditorStore().onChange(()=>{
            textShape.value = part?.expressions?.text?.value || "TEXT";
        }, "definition")
    }

    function createImagePartEntity(partModel){
        const part = partModel.store.getState();

        partModel.entity.addComponent(new Transform({
            position:new Vector3(...part.position),
            rotation:new Quaternion(...part.rotation),
        }));
        partModel.entity.setParent(entity);

        createInnerImage(part, partModel.entity, getPartCallback(partModel));
    }

    function createInnerImage(part, entity, callback){
        const imageEntity = new Entity();
        imageEntity.addComponent(new ImagePart());
        const shape = new PlaneShape();
        shape.withCollisions = false;
        imageEntity.addComponent(shape);
        const material = new Material();
        const texture = getTexture(`${part?.expressions?.image?.url}`, {samplingMode:0, hasAlpha:true});
        material.albedoTexture = texture;
        material.emissiveTexture = texture;
        Object.assign(material, defaultEmissive)
        imageEntity.addComponent(material);
        const imageWidth = part?.expressions?.image?.width !== undefined ? part?.expressions?.image?.width : 4;
        const imageHeight = part?.expressions?.image?.height !== undefined ? part?.expressions?.image?.height : 3;
        imageEntity.addComponent(new Transform({
            scale:new Vector3(-imageWidth,-imageHeight,-1)
        }))
        imageEntity.setParent(entity);
        imageEntity.addComponent(new OnPointerDown(callback, {hoverText:"select", distance:9999, button:ActionButton.POINTER}));
        getEditorStore().onChange(()=>{
            const imageTexture =  getTexture(`${part?.expressions?.image?.url || ''}`, {hasAlpha:true, samplingMode:0});
            material.albedoTexture = imageTexture;
            material.emissiveTexture = imageTexture;
            const imageWidth = part?.expressions?.image?.width !== undefined ? part?.expressions?.image?.width : 4;
            const imageHeight = part?.expressions?.image?.height !== undefined ? part?.expressions?.image?.height : 3;
            imageEntity.getComponent(Transform).scale.set(-imageWidth, -imageHeight,-1)
        }, "definition");
    }
    function adaptHandlerToPartAlias(alias){
        const partsData = getPartsData();
        const partDef = partsData.find(p => p.alias === alias);
        const handlerTransform = handler.getEntity().getComponent(Transform);
        if(alias === "initial_position"){
            handlerTransform.scale.set(0.2,0.2,0.2);
            handlerTransform.position.set(0,0,0);
            return;
        }else if(alias === "spawn"){
            handlerTransform.scale.set(1.2,1.2,1.2);
            handlerTransform.position.set(0,0,0);
            return;
        }

        if(partDef?.boundingBox){
            const [sx,sy,sz] = partDef.boundingBox.scale;
            const [x,y,z] = partDef.boundingBox.location;
            handlerTransform.scale.set(sx,sy,sz);
            handlerTransform.position.set(x,y,z);
        }else{
            handlerTransform.scale.set(4,2,4);
            handlerTransform.position.set(0,0,0);
        }
    }

    function editMode(){
        if(!avatarLock.locked){
            avatarLock.lock();
        }
        handler.enable();
        editorState.editorMode = EDITOR_MODE.EDIT;
        editorState.editorEditMode = EDITOR_EDIT_MODE.MOVE;
        handler.setMode(editorState.editorEditMode)
    }

    function selectMode(){
        if(avatarLock.locked){
            avatarLock.unlock();
        }
        handler.disable();
        editorState.editorMode = EDITOR_MODE.SELECT;
    }
}

export {
    createEditor
}
