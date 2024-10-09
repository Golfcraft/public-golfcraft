import {globalStore} from "../../../services/globalStore/globalStore";

export const createStreamScreens = (streamURL) => {

    let show_screen: string | false = false;
    let screens = [];

    //`https://emedia.dclconnect.io:5443/pablo/streams/357513022134756971644275.m3u8`
    //https://video.dcl.guru/live/pabloest/index.m3u8

    if (streamURL) {
        const myVideoClip = new VideoClip(streamURL);
        const myVideoTexture = new VideoTexture(myVideoClip)
        const myMaterial = new BasicMaterial();
        myMaterial.texture = myVideoTexture;

        const positions = [
            // Floor 0
            {
                position: new Vector3(5, 3.9, 20),
                scale: new Vector3(48 * 0.2, 27 * 0.2, 1),
                rotation: Quaternion.Euler(0, 90 - 10, 0)
            },
            // Floor 1
            {
                position: new Vector3(13, 11, 15),
                scale: new Vector3(48 * 0.1, 27 * 0.1, 1),
                rotation: Quaternion.Euler(0, -10, 0)
            },
            // Floor 3
            {
                position: new Vector3(24, 26 + 4, 47.5),
                scale: new Vector3(48 * 0.25, 27 * 0.25, 1),
                rotation: Quaternion.Euler(0, 180, 0)
            },
            // Floor 3
            {
                position: new Vector3(9.5, 40, 9.5),
                scale: new Vector3(48 * 0.3, 27 * 0.3, 1),
                rotation: Quaternion.Euler(0, 45, 0)
            },
        ]

        screens = positions.map((position) => {
            const screen = new Entity();
            const screenShape = new PlaneShape();
            screenShape.withCollisions = false;
            screen.addComponent(screenShape);
            screen.addComponent(
                new Transform(position)
            );
            screen.addComponent(myMaterial);
            screen.addComponent(
                new OnPointerDown(() => {
                    myVideoTexture.playing = !myVideoTexture.playing
                },{
                    showFeedback: false,
                })
            );
            engine.addEntity(screen);
            myVideoTexture.play();
            return {
                show: () => {
                    screenShape.visible = true;
                },
                hide: () => {
                    screenShape.visible = false;
                }
            }
        })

    }
    globalStore.game.onChange(({newValue, oldValue, prop})=>{
        const propertyChanged = prop;
        if((propertyChanged === "playing" || propertyChanged === "editing") && newValue){
            screens && screens.forEach((s,index)=>index < 3 && s?.hide());
        }else if((propertyChanged === "playing" || propertyChanged === "editing") && !newValue){
            screens && screens.forEach((s,index)=>index < 3 && s?.show());
        }
    },"playing")
}