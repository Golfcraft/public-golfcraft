import {getGLTFShape} from "../../../golfplay/services/resource-repo";
import {globalStore} from "../../services/globalStore/globalStore";
import {createImageButton} from "../imageButton";
import * as ui from "@dcl/ui-scene-utils";
import {showMessage} from "../server-notification";

export const createConfessionPanel = (parent, {position, rotation})=>{
    console.log("confesion panel");
    const entity = new Entity();
    const screen = new Entity();
    screen.addComponent(new Transform({
        position:new Vector3(0,-1,0)
    }))
    const shape = getGLTFShape(`models/board.glb`);

    entity.addComponent(new Transform({
        position, rotation
    }))
    const label = new Entity();
    label.addComponent(new Transform({
        position: new Vector3(0,1.8,0),
        scale:new Vector3(1.5,1.5,1)
    }))
    label.setParent(entity)
    const text = new TextShape();

    function getTextInLines(value){
        let result = "";
        const MAX_CHARS_PER_LINE = 45;
        const words = value.replace(/\s+/," ").split(" ");
        let i = 0;
        let charsInCurrentLine = 0;
        while(i < words.length){
            result += (words[i] +" ")
            charsInCurrentLine += (words[i].length + 1);
            if(charsInCurrentLine > MAX_CHARS_PER_LINE){
               charsInCurrentLine = 0;
               result += `\n`;
            }
            i++;
        }
        return result;
    }
    text.fontSize = 1;
    text.value = "RANDOM ANONYMOUS CONFESSION\n\nLoading ...";
    label.addComponent(text);

    screen.addComponent(shape);
    screen.setParent(entity);
    entity.setParent(parent);
    const refreshHandler = new Entity();
    refreshHandler.addComponent(new BoxShape());
    refreshHandler.addComponent(new Transform({
        scale:new Vector3(4,2,0.3),
        position:new Vector3(0,1.8,0)
    }));
    const transparentMaterial = new Material();
    transparentMaterial.albedoColor = new Color4(1,0,0,0);
    refreshHandler.addComponent(transparentMaterial);
    refreshHandler.setParent(entity);
    getRandomConfession();

    refreshHandler.addComponent(new OnPointerDown(()=>{
        getRandomConfession();
    }, {hoverText:"Refresh"}));

    async function getRandomConfession(){
        const confession = await fetch(`https://golfcraftgame.com/api/get-random-confession?r=${Date.now()}`).then(r=>r.text());
        if(!confession || confession.length > 280) return;
        text.value = "RANDOM ANONYMOUS CONFESSION\n\n"+getTextInLines(confession);
    }

    const enterButton = createImageButton(entity, {
        rotation:Quaternion.Zero(),
        position:new Vector3(0, 0.5,0),
        scale:new Vector3(-1,-0.4,-1),
        imageSrc:`images/button-play.png`,
        alphaSrc:`images/button-play.png`,
        hoverText:`Enter your anonymous confession`
    });
    let prompt = new ui.FillInPrompt(
        "Write your anonymous confession with 280 chars max:",
        (value: string) => {
            if(!value) return;
            if(value.length > 280){
                showMessage({timeout: 5000, message: "Too long"});
                return;
            }
            fetch(`https://golfcraftgame.com/api/submit-confession`,{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({
                    text:value
                })
            });
        },
        'Submit!',
        "Write text here"
    );
    prompt.text.fontSize = 12;
    prompt.fillInBox.height = 100;
    prompt.fillInBox.textWrapping = true;
    prompt.fillInBox.fontSize = 8;
    prompt.fillInBox.positionY = 0;
    prompt.button.positionY = -80;
    prompt.hide();
    enterButton.onClick(()=>{
        //TODO open prompt, then send text;
        prompt.show();
    })
    const show = () => {
        entity.setParent(parent);
    };

    const hide = () => {
        entity.setParent(null);
        engine.removeEntity(entity);
    };

    globalStore.game.onChange(showOrHide,"playing");
    globalStore.game.onChange(showOrHide,"editing");

    function showOrHide({newValue, oldValue, prop}){
        if(newValue){
            hide();
        }else{
            show();
        }
    }
    return {
        show,
        hide
    }
}