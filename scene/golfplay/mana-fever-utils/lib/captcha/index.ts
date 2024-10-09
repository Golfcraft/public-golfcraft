const createCaptcha = ({imageSrc, onSubmit}) => {
    console.log("createCaptcha", imageSrc);
    const callbacks = {
        onSubmit
    }
    const canvas = new UICanvas();
    const dialog = new UIContainerRect(canvas);
    dialog.width = 400;
    dialog.height = 300;
    dialog.adaptWidth = true;
    dialog.adaptHeight = true;
    dialog.color = Color4.White();
    const texture = new Texture(imageSrc);
    const image = new UIImage(dialog, texture);
    image.sourceLeft = 0;
    image.sourceTop = 0;
    image.sourceHeight = 100;
    image.sourceWidth = 200;
    image.width = 200;
    image.height = 100;
    image.hAlign = "center";
    image.vAlign = "top";
    image.positionY = -20;

    const text = new UIText(dialog)
    text.value = "Press ESC to release mouse pointer\nWrite the text above and press Enter";
    text.vAlign = "top";
    text.hAlign="center";
    text.hTextAlign = "center";
    text.positionY = -125;
    text.color = Color4.Black();
    text.fontSize = 20;

    const input = new UIInputText(dialog);
    input.vAlign = "top";
    input.positionY = -200;
    input.width = 200;
    input.fontSize = 20;
    input.paddingBottom = 10;
    input.paddingLeft = 10;
    input.height = 40;

    input.onTextSubmit = new OnTextSubmit(({id, text}) => {
        callbacks.onSubmit(text);
    });
console.log("image.data",image.data)

    const resultText = new UIText(dialog);
    resultText.value = "";
    resultText.color = Color4.Red();
    resultText.fontSize = 16;
    resultText.vAlign = "bottom";
    resultText.positionY = 20;
    resultText.hTextAlign = "center";

    return {
        hide:()=>{
            dialog.visible = false;
        },
        show:()=>{
            dialog.visible = true;            
        },
        setResultText:(value)=>{
            resultText.value = value;
        },
        updateImage:({imageSrc})=>{
            //texture.src = imageSrc
            image.visible = false;
            const texture = new Texture(imageSrc);            
            const newImage = new UIImage(dialog, texture);
            newImage.sourceLeft = 0;
            newImage.sourceTop = 0;
            newImage.sourceHeight = 100;
            newImage.sourceWidth = 200;
            newImage.width = 200;
            newImage.height = 100;
            newImage.hAlign = "center";
            newImage.vAlign = "top";
            newImage.positionY = -20;
        }
    }
};

export {createCaptcha};