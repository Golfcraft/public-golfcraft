import {createBoard} from "../../components/board";
import { createImageButton } from "../../components/imageButton";
import { hideAvatarInFronOf } from "../../components/panel-hide-avatar";

let centerDialog;
const createLoginUX = (parent) => {
    let actionCallback = ()=>{};

    const board = createBoard(parent, {
        position:new Vector3(0, 0+1, -7),
        rotation:Quaternion.Euler(0, -90, 0)
    });
    board.setParent(parent);
    const label = new Entity();
    const text = new TextShape("You need to sign in\nwith Metamask\nto connect to Golfcraft");
    text.vTextAlign = "top";
    text.hTextAlign = "center";
    label.addComponent(text);
    text.fontSize = 2;
    text.color = new Color3(1,1,0.8);
    label.setParent(board);
    label.addComponent(new Transform({
        position: new Vector3(0,3,-0.1)
    }));
    const loginButton = createImageButton(board,{
        position:new Vector3(0, 1.6, 0),
        scale:new Vector3(-1.2,-0.55,-1),
        rotation:Quaternion.Euler(0, 0, 0),
        imageSrc:`images/login.png`,
        alphaSrc:undefined,
        hoverText:'Sign in with metamask'
    } )
    hideAvatarInFronOf(board);
    loginButton.onClick(()=>actionCallback());

    centerDialog = {
        updateText:(value)=>text.value = value,
        hide:()=>{
            board.setParent(null);
            engine.removeEntity(board)
        },
        show:()=>{
            board.setParent(parent);
        },
        showButton:()=>{
            loginButton.show();
        },
        hideButton:()=>{
            loginButton.hide();
        },
        setActionCallback:(fn)=>{
            actionCallback=fn;
            return ()=>actionCallback = null;
        }
    };

    return centerDialog;
};

export {
    createLoginUX
}
