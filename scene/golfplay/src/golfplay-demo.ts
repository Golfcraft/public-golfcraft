import { createVisualCourse } from "./components/course/course-visual-loader";
import { createPhysicsWorld, initializeMaterials} from "../physics/world";
import { createPhysicBall} from "../physics/ball";
import { loadCoursePhysics} from "../physics/course-element-loader";
import { createShootControl } from "./components/shoot-control";
import { createGameHandler} from "./gameplay-handlers/gameplay-handler";
import { EVENT} from "./gameplay-handlers/handler-def";
import { getCourseDefinition } from "../../../common/course-definitions/course-definition-repository";
import { reproduceAvatarSound } from "../mana-fever-utils/lib/sound/avatar-sound";
import { sleep } from "../../../common/utils";
import {migrateCourseDefinitionAnimations} from "../../../common/course-animations-migration";
import { VisualBallFactory } from "./components/ball";

const noop = ()=>{};
declare const CANNON;

var disabled = false;
var text_entity: Entity

export function getGlobalPosition (entity: IEntity) {
    let entityPosition = entity.hasComponent(Transform) ? entity.getComponent(Transform).position.clone() : Vector3.Zero()
    let parentEntity = entity.getParent()

    if (parentEntity != null) {
        let parentRotation = parentEntity.hasComponent(Transform) ? parentEntity.getComponent(Transform).rotation : Quaternion.Identity
        return getGlobalPosition(parentEntity).add(entityPosition.rotate(parentRotation))
    }

    return entityPosition
}

export const createDemoGolfPlay = async (parent:Entity, {gameDefinition}:any) => {
    const {createVisualBall} = VisualBallFactory({baseResourceUrl:engine["__COURSE_MODELS_BASE__"]});

    const courseDefinition:any = gameDefinition.courseDefinition || migrateCourseDefinitionAnimations( await getCourseDefinition(gameDefinition, fetch, true));
    const ballSpawnDefinition = courseDefinition.parts.find((part:any)=>part.type === "initial_position");
    //const initialPlayerPosition = new Vector3(...courseDefinition.parts.find((part:any)=>part.type === "spawn").position);
    initializeMaterials();
    const {world} = createPhysicsWorld();
    const ball = createVisualBall(parent, {position:new Vector3(...ballSpawnDefinition.position)});
    const physicBall = createPhysicBall(world, { position:ballSpawnDefinition.position });

    physicBall.body.sleep();
    physicBall.onCollide((e)=>{
        if(e.body.material.name === "woodMaterial"){
            ball.reproduceSound("wood", Math.min(1, physicBall.body.velocity.length()/10));
        }else if(e.body.material.name === "dumperMaterial"){
            ball.reproduceSound("bumper", Math.min(1, physicBall.body.velocity.length()/25));
        }
    });

    let positionBeforeShoot;
    let positionCallback = async (pos) => {};
    let shootCallback = async (shoots) => {};
    const visualCourse = createVisualCourse(parent, {courseDefinition});
    const physicParts = loadCoursePhysics(world, {CANNON, courseDefinition:courseDefinition});
    const gamePlayState = {idle:true, shoots:0, shootStartTime:null};

    const gameHandler = createGameHandler({
        gameType:'competition', world, parts:physicParts, ballBody:physicBall.body, state: gamePlayState, courseDefinition, movingPhysicParts:{}, onExpressionEvent:noop});
    const setIdle = () => {
        gamePlayState.idle = true;
        log("IDLE true")
        control.show();
        control.setPosition(physicBall.body.position);
    }

    gameHandler.onEvent(EVENT.OUT, ({type, data})=>{
        physicBall.body.sleep();
        physicBall.body.position.set(positionBeforeShoot.x, positionBeforeShoot.y, positionBeforeShoot.z)
        setIdle();
    });

    gameHandler.onEvent(EVENT.SLEEP, async (data)=>{
        await sleep(1);
        physicBall.body.sleep();
        setIdle();
        shootCallback(gamePlayState.shoots);
        text_entity.getComponent(TextShape).visible = true;
    });

    const control = initializeControl();
    const updateSystem = new UpdateSystem(update); //TODO disable when not using it, e.g. when playing normal game
    engine.addSystem(updateSystem);

    var lastTime = Date.now()/1000;
    const STEPS_FPS = 60*4;
    const FRAME_SPEED = 1;

    const timeStep = 1/STEPS_FPS;
    var cannonInterval = setInterval(()=>{
        //if (gamePlayState.idle) return;
        var now = Date.now() / 1000;
        var timeSinceLastCall = now - lastTime;
        
        world.step(timeStep*FRAME_SPEED, timeSinceLastCall);
        lastTime = now;
    }, 15);

    
    function update(dt:number){
        //if (gamePlayState.idle) return;
        ball.setPosition(physicBall.body.position, physicBall.body.quaternion);
        const ball_local_position = new Vector3(physicBall.body.position.x, physicBall.body.position.y, physicBall.body.position.z)
        const ball_global_position = parent.getComponent(Transform).position.add(ball_local_position.rotate(parent.getComponent(Transform).rotation))
        positionCallback(ball_global_position);
        gameHandler.update(dt, undefined, true);
    }

    function dispose () {
        clearInterval(cannonInterval);
        //callbacks.onFinish = null;
        updateSystem.dispose();
        control.dispose();
    }

    function onFinish(fn:Function){
        //callbacks.onFinish = fn;
    }

    function initializeControl(){
        const control = createShootControl(parent, {
            position:new Vector3(...ballSpawnDefinition.position),
            rotation:new Quaternion(...ballSpawnDefinition.rotation),
            golfclub:{
                power:2,
                control:2,
                aim:2,
                id:"8",
            }
        });
        control.disableBottomPanel();
        control.disableRotation(true);
        control.setPower(5);
        control.onShoot(async ({impulse, delayMs})=>{
            if (disabled) return;
            control.hide();
            await sleep(delayMs);
            gamePlayState.idle = false;
            positionBeforeShoot = physicBall.body.position.clone();
            const {x,y,z} = impulse;

            physicBall.wakeUp();
            physicBall.applyImpulse(new CANNON.Vec3(x,y,z), physicBall.body.position);
            ball.reproduceSound("shoot"+(impulse.length()>13?2:1),1);
            gamePlayState.shoots++;
            text_entity.getComponent(TextShape).visible = false;
        });

        //const control_position = control.getEntity().getComponent(Transform).position;
        const root_entity = new Entity();
        root_entity.addComponent(new Billboard(false, true, false));
        root_entity.addComponent(
            new Transform(
                {
                    position: new Vector3(0, 0, 0)
                }
            )
        );

        text_entity = new Entity();
        text_entity.addComponent(
            new Transform(
                {
                    position: new Vector3(0, 1.2, 0)
                }
            )
        );
        text_entity.addComponent(new Billboard(false, true, false));
        var text_shape = new TextShape("Oh!");
        text_entity.addComponent(text_shape);
        //text_shape.font = new Font(Fonts.SansSerif);
        text_shape.fontSize = 2;
        text_shape.color = Color3.Yellow(); //new Color3(81, 83, 46);
        //text_shape.outlineWidth = 0.3;
        //text_shape.outlineColor = Color3.Black();
        text_shape.shadowColor = Color3.Black();
        text_shape.shadowOffsetY = 1;
        text_shape.shadowOffsetX = -1;
        text_shape.shadowBlur = 2;
        text_shape.hTextAlign = "center";
        text_shape.vTextAlign = "bottom";
        //engine.addEntity(text_entity);
        //root_entity.setParent(control.getEntity());
        text_entity.setParent(control.getEntity());

        return control;
    }

    function setPositionCallback(_callback) {
        positionCallback = _callback;
    }

    function setShootCallback(_callback) {
        shootCallback = _callback;
    }

    function hideControl(_hide) {
        if (_hide) {
            disabled = true;
        } else {
            disabled = false;
        }
    }

    function setText(_text) {
        text_entity.getComponent(TextShape).value = _text;
    }

    function setPower(_power: number) {
        control.setPower(_power);
    }

    function setBallPosition(x:float, y:float, z:float) {
        physicBall.body.sleep();
        physicBall.body.position.set(x, y, z)
        setIdle();
    }

    function getBallPosition() {
        return {
            x: physicBall.body.position.x,
            y: physicBall.body.position.y,
            z: physicBall.body.position.z,
        }
    }

    function disableRotation(_disable: boolean) {
        control.disableRotation(_disable);
    }

    return {
        dispose,
        onFinish,
        setPositionCallback,
        setShootCallback,
        hideControl,
        setText,
        setPower,
        setBallPosition,
        getBallPosition,
        disableRotation
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