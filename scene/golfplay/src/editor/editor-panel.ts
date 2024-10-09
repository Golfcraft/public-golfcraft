import {USE_REMOTE_SERVER} from "../../../../common/constants";
import {globalStore} from "../../../src/services/globalStore/globalStore";

const createButton = (parent, {buttonMaterial, label, onClick, position, scale, fontSize = 2, hoverText, fontColor}:any)=>{
    const callbacks = {
        onClick
    };
    const state = {
        visible:true
    };
    const create = new Entity();
    create.setParent(parent);
    const createButton = new Entity();
    const box = new BoxShape()
    createButton.addComponent(box);

    create.addComponent(new Transform({
        position,
    }));

    createButton.addComponent(new Transform({
        scale:scale ||new Vector3(1.5, 0.5, 0.1),
        position:new Vector3(0,0,-0.15)
    }))
    createButton.addComponent(buttonMaterial);
    createButton.setParent(create);
    const createLabel = new Entity();
    const createText = new TextShape();
    if(fontColor){
        createText.color = fontColor
    }
    createText.value = label;
    createText.fontSize = fontSize;
    createLabel.setParent(create);
    createLabel.addComponent(createText);
    createLabel.addComponent(new Transform({
        position:new Vector3(0,0,-0.151)
    }))



    const createCallbackComponent = new OnPointerDown(()=>callbacks.onClick(), {hoverText});
    createButton.addComponent(createCallbackComponent);

    return {
        hide:()=>{
            if(!state.visible) return;
            state.visible = false;
            create.setParent(null);
            engine.removeEntity(create);
        },
        show:()=>{
            if(state.visible) return;
            state.visible = true;
            create.setParent(parent);
        },
        dispose:()=>{
            create.setParent(null);
            engine.removeEntity(create);
        },
        setLabel:(label)=>{
            createText.value = label;
        },
        setHoverText:(text)=>{
            const onPointer =  create.getComponentOrNull(OnPointerDown)
            if(onPointer) onPointer.hoverText = text;
        }
    }
}

const createEditorPanel = async (parent, {position, rotation, onCreate, onLoad, onTest, onPublish, fontColor, shape}:{position:Vector3, rotation:Quaternion, onCreate:any, onLoad:any, onTest:any, onPublish:any, fontColor:any, shape:any}) => {
    const PAGE_SIZE = 3;
    const callbacks = {
        onCreate,
        onLoad,
        onTest,
        onPublish
    };
    const entity = new Entity();
    entity.setParent(parent);
    entity.addComponent(new Transform({
        position:position||Vector3.Zero(),
        rotation:rotation||Quaternion.Zero()
    }))
    enum STATUS {
        MAIN,
        LOAD
    }

    const state = {
        status:STATUS.MAIN,
        courses:[],
        coursesCurrentPage:0,
        loading:true
    };

    const screen = new Entity();
    screen.addComponent(shape || new BoxShape())
    screen.addComponent(new Transform({
      //  scale:new Vector3(4,3,0.1),
        position:new Vector3(0,-0.8,0)
    }));
    screen.setParent(entity);
    const buttonMaterial = new Material();
    buttonMaterial.albedoColor = new Color4(1,1,1,0.3)

    const create = createButton(entity, {
        buttonMaterial, label:"CREATE NEW", onClick:()=>callbacks.onCreate(),
        position:new Vector3(-1,1.8,0),
        hoverText:"Create new golf course",
        fontColor
    });

    const load = createButton(entity,{
        buttonMaterial, label:"LOAD GOLF COURSE", fontSize:1, onClick:()=>{
            state.status = 1;
            applyState();
        }, position:new Vector3(1,1.8,0),
        hoverText:"Load golf course",
        fontColor
    });

    const testValidate = createButton(entity, {
        buttonMaterial, label:"TEST / VALIDATE", fontSize:1, onClick:()=>{
            state.status = 2;
            applyState();
        }, position:new Vector3(-1,1,0),
        hoverText:"Test and validate golf course",
        fontColor
    });

    const publish = createButton(entity, {
        buttonMaterial, label:"PUBLISH", fontSize:1, onClick:()=>{
            state.status = 3;
            applyState();
        }, position:new Vector3(1,1,0),
        hoverText:"Publish map",
        fontColor
    });

    if(globalStore?.userData && globalStore.userData.getState().userId !== "0x598f8af1565003ae7456dac280a18ee826df7a2c"){//TODO
        publish.hide();
    }

    const baseURLAPI = USE_REMOTE_SERVER?`https://golfcraftgame.com`:`http://localhost:2569`;

    const map1 = createButton(entity, {
        buttonMaterial,
        label:"map1",
        onClick:()=> getStatusMApFn(state.status)(state.coursesCurrentPage, 0),
        position:new Vector3(-0.1, 2.5, 0),
        scale:new Vector3(3.5,0.5, 0.5),
        hoverText:"Load this golf course",
        fontColor
    });
    const map2 = createButton(entity, {
        buttonMaterial,
        label:"map2",
        onClick:()=> getStatusMApFn(state.status)(state.coursesCurrentPage, 1),
        position:new Vector3(-0.1, 1.9, 0),
        scale:new Vector3(3.5,0.5, 0.5),
        hoverText:"Load this golf course",
        fontColor
    });
    const map3 = createButton(entity, {
        buttonMaterial,
        label:"map3",
        onClick:()=> getStatusMApFn(state.status)(state.coursesCurrentPage, 2),
        position:new Vector3(-0.1, 1.3, 0),
        scale:new Vector3(3.5,0.5, 0.5),
        hoverText:"Load this golf course",
        fontColor
    });

    const back = createButton(entity, {
        buttonMaterial,
        label:"back",
        onClick:()=>{
            state.status = 0;
            applyState();
        },
        position:new Vector3(1.25,0.5, 0),
        fontColor
    });

    const pagination = createButton(entity, {
        buttonMaterial,
        label:"1/1",
        onClick:()=>{
            state.coursesCurrentPage += 1;
            if(state.coursesCurrentPage === Math.ceil(state.courses.length/3)) state.coursesCurrentPage = 0;
            applyState();
        },
        hoverText:"change page",
        position:new Vector3(-1,0.5,0),
        fontColor
    });



    await _loadCoursesData();

    function getStatusMApFn(status){
        if(status === 1){
            return loadMap;
        }else if(status === 2){
            return testMap;
        }else if(status === 3){
            return publishMap
        }
    }
    function publishMap(page, index){

        const selectedCourse = state.courses[page*3 + index];
        console.log("publish", selectedCourse, callbacks.onPublish);
        callbacks.onPublish(selectedCourse);
    }
    function testMap(page, index){
        const selectedCourse = state.courses[page*3 + index];
        console.log("testMap", selectedCourse);
        callbacks.onTest(selectedCourse);
    }
    function loadMap(page, index){
        const selectedCourse = state.courses[page*3 + index];
        console.log("loadMap", selectedCourse);
        callbacks.onLoad(selectedCourse);
    }
    function applyState(){
        if(state.status === 0){
            testValidate.show();
            create.show();
            load.show();
            map1.hide();
            map2.hide();
            map3.hide();
            back.hide();
            publish.show();
            pagination.hide();
        }else{
            testValidate.hide();
            pagination.show();
            pagination.setLabel(`${state.coursesCurrentPage+1}/${Math.ceil(state.courses.length/3)}`);
            create.hide();
            publish.hide();
            load.hide();
            if(state.loading){
                map1.hide();
                map2.hide();
                map3.hide();
            }else{
                map1.show();
                map2.show();
                map3.show();
            }
            back.show();
            const coursesToShow = state.courses.slice(state.coursesCurrentPage*3, state.coursesCurrentPage*3+3);
            const maps = [map1, map2, map3];
            maps.forEach(map=>map.hide());

            coursesToShow.forEach((course, index)=>{
                if(course){
                    maps[index].setLabel(`${course.displayName || course.alias} (${course.status === 4?"validated":"not validated"}) ${course.evaluation && extrapolateEvaluation(course.evaluation) || ""}`);
                    maps[index].show();
                }
            });
            if(state.status === 1){
                map1.setHoverText("Load golf course");
                map2.setHoverText("Load golf course");
                map3.setHoverText("Load golf course");
            }else if(state.status === 2){
                map1.setHoverText("Test / validate");
                map2.setHoverText("Test / validate");
                map3.setHoverText("Test / validate");
            }else if(state.status === 3){
                map1.setHoverText("Test / validate");
                map2.setHoverText("Test / validate");
                map3.setHoverText("Test / validate");
            }
        }

        if(!state.courses?.length){
            load.hide();
            testValidate.hide();
        }
    }

    return {
        hide:()=>{
            entity.setParent(null);
            engine.removeEntity(entity);
        },
        show:()=>{
            entity.setParent(parent);
        },
        loadCoursesData:()=>_loadCoursesData(),
        dispose:()=>{}
    };

    async function _loadCoursesData(){
        state.loading = true;
        applyState();
        state.courses = await fetch(`${baseURLAPI}/api/courses`,{
            method:"POST",
            headers:{"Content-Type": "application/json"},
            body:JSON.stringify({
                where:{
                    createdBy:globalStore?.userData?.getState()?.userId || 'admin-editor',
                    OR: [{isSeason: {not: 1}}, {isSeason: null}] // null must be explicitly added
                },
                orderBy:{created:"desc"},
                modifications:true
            })
        }).then(r=>r.json());
        state.loading = false;
        applyState();
    }
}

export {
    createEditorPanel
}

function extrapolateEvaluation(evaluation){
    return Math.ceil(evaluation * 5 / 400);
}