import * as ui from '@dcl/ui-scene-utils'
import { reproduceAvatarSound } from "../../services/avatar-sound";

export const createNumberPrompt = ({onSubmit, onReject, title, stack = 1, sounds = null}:any)=>{
    const prompt = new ui.CustomPrompt(ui.PromptStyles.LIGHT);
    const state = {
        value:0
    };
    const callbacks = {onSubmit, onReject};
    const valueText = prompt.addText(
        state.value.toString(),
        0,
        60,
        Color4.Black(),
        20
    )

    prompt.addButton(
        'Up',
        0,
        -40,
        () => {
            sounds ? reproduceSound(sounds[0]):null;
            state.value = state.value + stack;
            applyState();
        },
        ui.ButtonStyles.DARK
    )
    prompt.addButton(
        'Down',
        0,
        -90,
        () => {
            sounds ? reproduceSound(sounds[1]):null;
            state.value = Math.max(0, state.value - stack)
            applyState();
        },
        ui.ButtonStyles.DARK
    )
    prompt.addButton(
        'Submit',
        0,
        -150,
        () => {
            callbacks.onSubmit(state.value);
            prompt.hide();
        },
        ui.ButtonStyles.RED
    )
    prompt.addText(
        title,
        0,
        120,
        Color4.Black(),
        30
    )
    prompt.closeIcon.onClick = new OnPointerDown((e)=>{
        prompt.hide();
        callbacks.onReject();
    });
    prompt.hide();
    function applyState(){
        valueText.text.value = state.value.toString();
    }

    return {
        show:()=>prompt.show(),
        hide:()=>prompt.hide(),
    };
}


function reproduceSound(sounds) {
    if (sounds.length < 1) return;
    reproduceAvatarSound(sounds[Math.floor(Math.random() * sounds.length)]);
}