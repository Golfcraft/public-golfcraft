import {getGLTFShape, getTexture} from "../../services/resource-repo";
import {defaultEmissive} from "../emissive-image";
const RED = Color3.Red();
const GREEN = Color3.Green();
const BLUE = Color3.Blue();
const YELLOW = Color3.Yellow();
const COLOR_MATERIAL = {
    RED:new Material(),
    GREEN:new Material(),
    BLUE:new Material(),
    YELLOW:new Material()
}
COLOR_MATERIAL.RED.albedoColor = RED;
COLOR_MATERIAL.GREEN.albedoColor = GREEN;
COLOR_MATERIAL.BLUE.albedoColor = BLUE;
COLOR_MATERIAL.YELLOW.albedoColor = YELLOW;

const VisualBallFactory = ({baseResourceUrl}) => {//__COURSE_MODELS_BASE__
    const ballShape = new SphereShape();
    const ballMaterial = new Material();
    const ballTexture = getTexture(baseResourceUrl+`models/ball.png`);
    ballMaterial.albedoColor = Color4.Magenta()
    ballMaterial.emissiveIntensity = 0.6
    //ballMaterial.albedoTexture = ballTexture;
    //ballMaterial.emissiveTexture = ballTexture;
    //ballMaterial.alphaTexture = ballTexture;
    //ballMaterial.transparencyMode = 2 // Alpha blend
    const ballShape_gltf = getGLTFShape(baseResourceUrl + "models/ball.gltf");

    //Object.assign(ballMaterial, defaultEmissive);
    //ballMaterial.emissiveIntensity = 1.5;
    const woodClip = new AudioClip(baseResourceUrl+"sounds/wood.mp3");
    const woodSound = new AudioSource(woodClip);
    const shootClip = new AudioClip(baseResourceUrl+"sounds/Club/lvl_club_hit_light.mp3");
    const shootSound = new AudioSource(shootClip);
    const shootClip2 = new AudioClip(baseResourceUrl+"sounds/Club/lvl_club_hit_medium.mp3");
    const shootSound2 = new AudioSource(shootClip2);
    const holeSound = new AudioSource(new AudioClip(baseResourceUrl+"sounds/hole.mp3"));
    const sandSound= new AudioSource(new AudioClip(baseResourceUrl+"sounds/sand.mp3"));
    const windClip = new AudioClip(baseResourceUrl+"sounds/wind.mp3");
    const windSound = new AudioSource(windClip);
    const bumperClip = new AudioClip(baseResourceUrl + "sounds/bumper.mp3");
    const bumperSound = new AudioSource(bumperClip);
    //
    /*const idleClip = new AudioClip(baseResourceUrl + "sounds/Ball/lvl_ball_idle.mp3");
    const idleSound = new AudioSource(idleClip);
    idleSound.loop = true
    idleSound.playing = true*/

    const collBaseLightClip = new AudioClip(baseResourceUrl+"sounds/Ball/ball_coll_base_light.mp3");
    const collBaseLightSound = new AudioSource(collBaseLightClip);

    const collWallEgyptLightClip = new AudioClip(baseResourceUrl+"sounds/Ball/lvl_ball_coll_wall_egypt_light_01.mp3");
    const collWallEgyptLightSound = new AudioSource(collWallEgyptLightClip);


    const createVisualBall = (parent:Entity, {position, dummy, displayName, id, _scale, _color, collectionId}:{position:Vector3, dummy?:boolean, displayName?:string, id?:any, _scale?:Vector3, _color?:Color4, collectionId?:number})=>{
        const ball = new Entity("ball");
        const ballVisible = new Entity();
        ballVisible.setParent(ball);
        if (!displayName) {
            const ballVisibleGLTF = new Entity();
            ballVisibleGLTF.setParent(ball);
            ballVisibleGLTF.addComponent(ballShape_gltf);
        }

        var mat;
        if(!_color){
            ballVisible.addComponent(ballMaterial);
        }else{
            mat = new Material();
            mat.albedoColor = _color;
            ballVisible.addComponent(mat);
        }


        //const sndIdle = new Entity();
        const sndBase = new Entity();
        const sndWood = new Entity();
        const sndShoot1= new Entity();
        const sndShoot2 = new Entity();
        const effects = new Entity();
        effects.setParent(ball);
        //sndIdle.setParent(ball);
        sndBase.setParent(ball);
        sndWood.setParent(ball);
        sndShoot1.setParent(ball);
        sndShoot2.setParent(ball);
        //sndIdle.addComponent(idleSound);
        sndBase.addComponent(collBaseLightSound);
        sndWood.addComponent(woodSound);
        sndShoot1.addComponent(shootSound);
        sndShoot2.addComponent(shootSound2);
        ballShape.withCollisions = false;
        ballShape.isPointerBlocker = false;
        ballShape.visible = true;
        let scale = _scale || new Vector3(0.09,0.09,0.09);
        let name;
        if(!dummy){
            ballVisible.addComponent(ballShape);
            ballVisible.addComponent(new Transform({scale}));
            if(displayName){
                name = new Entity();
                const text = new TextShape(displayName);
                name.addComponentOrReplace(text);
                name.setParent(parent);
                name.addComponent(new Billboard(false, true, false));
                name.addComponent(new Transform({
                    position:new Vector3(position.x,position.y+0.2,position.z),
                    scale
                }))
            }
        }else{
            const material = new Material();
            material.albedoColor = new Color4(1,1,1,0.3);
            ballVisible.addComponent(new BoxShape);
            ballVisible.addComponent(material);
            scale = new Vector3(0.2,0.2,0.2);
        }


        ball.addComponent(new Transform({
            position,
            rotation:Quaternion.Zero()
        }));
        ball.setParent(parent);

        return {
            id,
            changeColor:(color:string)=>{
                ballVisible.addComponentOrReplace(COLOR_MATERIAL[color])
            },
            getPosition:()=>{
                return ball.getComponent(Transform).position;
            },
            setPosition:(position:Vector3, rotation?: Quaternion)=>{
                ball.getComponent(Transform).position.set(position.x, position.y, position.z);//copyFrom(position);
                if(rotation) ball.getComponent(Transform).rotation.set(rotation.x, rotation.y, rotation.z, rotation.w);
                if(displayName){
                    name.getComponent(Transform).position.set(position.x, position.y+0.2, position.z);//copyFrom(position);
                }
            },
            getEntity:()=>ball,
            reproduceSound:(name, volume = 1)=>{
                if(name === "wood"){
                    //console.log("collectionId: "+collectionId)
                    if (collectionId==0) {
                        sndWood.addComponentOrReplace(collWallEgyptLightSound);
                        collWallEgyptLightSound.volume = volume;
                        collWallEgyptLightSound.playOnce();
                    } else{
                        sndWood.addComponentOrReplace(woodSound);
                        woodSound.volume = volume;
                        woodSound.playOnce();
                    }
                    collBaseLightSound.volume = 1;
                    collBaseLightSound.playOnce();
                }else if(name === "shoot1"){
                    shootSound.volume = 1;//volume;
                    shootSound.playOnce();
                }else if(name === "shoot2"){
                    shootSound2.volume = 1;//volume;
                    shootSound2.playOnce();
                }else if(name === "hole"){
                    effects.addComponentOrReplace(holeSound);
                    holeSound.volume = volume;
                    holeSound.playOnce();
                }else if(name === "sand"){
                    effects.addComponentOrReplace(sandSound);
                    sandSound.volume = volume;
                    sandSound.playOnce();
                }else if(name === "wind" || name === "direction_area"){
                    effects.addComponentOrReplace(windSound);
                    windSound.volume = volume;
                    windSound.playOnce();
                }else if( name  === "bumper"){
                    effects.addComponentOrReplace(bumperSound);
                    bumperSound.volume = volume;
                    bumperSound.playOnce();
                }

            },
            dispose:()=>{
                ball.setParent(null);
                engine.removeEntity(ball);
                if(displayName){
                    name.setParent(null);
                    engine.removeEntity(name);
                }
            },
            show,
            hide
        };
        function show(){
            ball.setParent(parent);
        }
        function hide(){
            ball.setParent(null);
            engine.removeEntity(ball);
        }
    }
    return {createVisualBall};
}

export {
    VisualBallFactory
}
