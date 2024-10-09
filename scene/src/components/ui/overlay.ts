//import courseMockTrainingHole from "../../../../common/course-definitions/courseMockTrainingHole";
import {getCanvas} from "../../../golfplay/services/canvas";

const canvas = getCanvas();

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

const overlay = new UIContainerRect(canvas);
overlay.color = Color4.Black();
overlay.width = 3000;
overlay.height = 3000;
overlay.visible = false;
overlay.isPointerBlocker = false;

let updateOverlay;
export const getOverlay = ()=>overlay;
export const fadeInOverlay = async (seconds, onFinish?, options = {startColor:new Color4(0,0,0,0), endColor:new Color4(0,0,0,1)}) => {
    return new Promise((resolve)=>{
        if(updateOverlay){
            updateOverlay.dispose();
        }

        const state = {
            count:0
        }
        overlay.visible = true;
        overlay.color = options.startColor;

        let selfUpdate = updateOverlay = new UpdateSystem((dt)=>{
            state.count += dt;
            if(state.count < seconds){
                overlay.color = Color4.Lerp(options.startColor, options.endColor, state.count/seconds) // new Color4(0,0,0,normalizeTo1(state.count, seconds));
            } else {
                overlay.color = options.endColor;
                if(selfUpdate === updateOverlay){
                    updateOverlay.dispose();
                    updateOverlay = null;
                    selfUpdate = null;
                }
                onFinish && onFinish();
                resolve();

                console.log("fadeIn Done");
            }
        });
    })
}


export const fadeOutOverlay = (seconds, onFinish?, options = {startColor:new Color4(0,0,0,1), endColor:new Color4(0,0,0,0)}) => {
    return new Promise((resolve, reject) => {
        if(updateOverlay) updateOverlay.dispose();
        const state = {
            count:0
        }

        overlay.visible = true;
        overlay.color = options.startColor;
        let selfUpdate = updateOverlay = new UpdateSystem((dt) => {
            state.count += dt;
            if(state.count < seconds){
                overlay.visible = true;
                overlay.color = Color4.Lerp(options.startColor, options.endColor, state.count/seconds) // new Color4(0,0,0,normalizeTo1(state.count, seconds));
            } else {
                overlay.visible = false;
                if(selfUpdate === updateOverlay){
                    updateOverlay.dispose();
                    updateOverlay = null;
                    selfUpdate = null;
                }
                onFinish && onFinish();
                resolve();
            }
        });
    });
}