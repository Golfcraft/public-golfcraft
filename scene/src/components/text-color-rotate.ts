const DEFAULT_COLORS = [
    "#d64e4e",
    "#d6a74e",
    "#b4d64e",
    "#4ed6a0",
    "#4e85d6",
    "#954ed6",
    "#d64ec9"
];
const CHAR_REGEXP = /\w*/;
export const createTextColorRotate = (parent, {position, billboard, rotation, value, colors = DEFAULT_COLORS}:any) => {
    const entity = new Entity();
    const lines = value.split("\n");
    const show = ()=>{};
    const hide = ()=>{};

    const text = new TextShape(value);
    text.value = value;
    entity.setParent(parent);
    entity.addComponent(text);
    entity.addComponent(new Transform({
        position
    }))
    const charColors = [];

    let currentColorIndex = 0;
    let textValue = ""
    if(billboard){
        entity.addComponent(new Billboard());
    }
    value.split("").forEach((char) => {
        if(CHAR_REGEXP.test(char)) {
            charColors.push(colors[currentColorIndex]);
            textValue += `<color=${colors[currentColorIndex]}>${char}</color>`;
        }else{
            textValue += char;
        }
        currentColorIndex++;
        if(currentColorIndex >= colors.length) currentColorIndex = 0;
    });
    text.value = textValue;

    console.log(textValue)

    new UpdateSystem(()=>{

    })

    return {
        show,
        hide
    }
}

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