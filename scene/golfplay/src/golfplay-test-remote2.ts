import {registerSound, reproduceAvatarSound} from "../mana-fever-utils/lib/sound/avatar-sound";
import Colyseus = require('colyseus.js');
import { getCourseDefinition } from "../../../common/course-definitions/course-definition-repository";
import { migrateCourseDefinitionAnimations } from "../../../common/course-animations-migration";
import MESSAGE from "../../../server/rooms/mesages";
import { createShootControl } from "./components/shoot-control";
import { movePlayerTo } from "@decentraland/RestrictedActions";
import { createVisualCourse } from "./components/course/course-visual-loader";
import { sleep } from "../../../common/utils";
import { VisualBallFactory } from "./components/ball";
import { CheckpointFactory } from "./components/visual-checkpoint";
import {setTimeout} from "@dcl/ecs-scene-utils";
import {getUserData} from "@decentraland/Identity";
import {createTopBar} from "../../src/components/ui/topbar";
import {getCanvas} from "../services/canvas";
import {createShootControl2} from "./components/shoot-control/index-camera-version";
import { createPhysicBall } from "../physics/ball";
import {createPhysicsWorld} from "../physics/world";
import {decorateRemotePhysicParts, loadCoursePhysics} from "../physics/course-element-loader";

export async function createRemoteGamePlay2(remote, remoteGameDefinition, parent, PlayFabId?){
    const callbacks = {
        onFinish:null
    }
    try{
        registerSound("checkpoint", engine["__COURSE_MODELS_BASE__"]);
    }catch(error){}
    await decorateRemotePhysicParts(fetch, true);
    const {createVisualBall} = VisualBallFactory({baseResourceUrl:engine["__COURSE_MODELS_BASE__"]});
    const {createCheckpoint} = CheckpointFactory({baseResourceUrl:engine["__COURSE_MODELS_BASE__"]});
    const {world} = createPhysicsWorld();
    await sleep(1);
    var lastPingTime = Date.now();
    var lastPing = 0;
    let serverTimeOffset = 0;
    const colyseus = typeof remote === "string"? new Colyseus.Client(`${remote}`):remote;
    const gameDefinition = remoteGameDefinition;
    const courseDefinition = migrateCourseDefinitionAnimations(await getCourseDefinition(gameDefinition, fetch, true));
    const physicParts = loadCoursePhysics(world, {CANNON, courseDefinition});

    const ballSpawnDefinition = courseDefinition.parts.find((part:any)=>part.type === "initial_position");
    const visualBalls = {};
    const physicBalls = {};
    const STEPS_FPS = 60*4.2;//252
    const timeStep = 1/STEPS_FPS;

    const user = (await getUserData());
    const {userId, displayName} = user;

    const topBar = createTopBar({duration:0, hTextAlign:"left"});
    topBar.hide();
    const room = await colyseus.joinOrCreate(`race-event-room`, {
        roomInstanceId:Math.random().toString().split(".")[1],
        user:{
            ...user,
            avatar:undefined},
        realm:'locahost', userId, PlayFabId:PlayFabId||'942F61A5654C5504',
        displayName,
        courseId:gameDefinition.courseId,
        gameDefinition:{
            ...gameDefinition
        },
       // courseDefinition,
        timeStep,
    });


    let myBallId = -1;
    room.onError((code, message)=>{
        console.log("Colyseus error",code, message);
    });

    room.onMessage(MESSAGE.BALL_ID, (ballId)=>{
        console.log("myBallId", ballId);
        myBallId = ballId;
    });
    room.send(MESSAGE.PING);
    room.state.balls.onRemove = (_ball, key)=>{
        visualBalls[key].dispose();
    };
    room.onMessage(MESSAGE.COMPLETED, async ({time})=>{
        gamePlayState.finished = true;
        console.log("local - server", Date.now() - gamePlayState.localStartTime, time)
        topBar.updateTime(time,true);

        updateSystem.dispose();
        visualCourse.dispose();
        visualCheckpoints.forEach(c=> {
            c.dispose();
        });
        control.dispose();
        Object.values(visualBalls).forEach(ball => ball.dispose());
        engine.removeSystem(updateSystem);
        clearInterval(pingInterval);
        callbacks.onFinish && callbacks.onFinish();
        room.leave();
        await sleep(5000);
        topBar.hide();

    })


    function offsetNow(){
        return Date.now() - serverTimeOffset;
    }

    room.state.balls.onAdd = (_ball, key) => {
        //myBallId is not yet set the first time
        console.log("Added ball",key, myBallId, _ball);
        const [x,y,z] = ballSpawnDefinition.position;
        visualBalls[key] = createVisualBall(parent, {id:key, position:new Vector3(x,y,z), displayName:userId === _ball.userId?undefined:_ball.displayName});
        console.log("xyz",x,y,z)
        visualBalls[key].setPosition(new Vector3(x,y,z));
        physicBalls[_ball.id] = createPhysicBall(world, {id:_ball.id, position:[x,y,z]});
        physicBalls[_ball.id].body.sleep();
console.log("room.state.balls[_ball.id].position.x",room.state.balls[_ball.id].position.x)
        Object.assign(physicBalls[_ball.id].body.position, room.state.balls[_ball.id].position);
        Object.assign(physicBalls[_ball.id].body.velocity, room.state.balls[_ball.id].velocity);
        Object.assign(physicBalls[_ball.id].body.angularVelocity, room.state.balls[_ball.id].angularVelocity);
        Object.assign(physicBalls[_ball.id].body.quaternion, room.state.balls[_ball.id].quaternion);

        _ball.position.onChange = (changes)=>{
            //console.log("ball position change", room.state.balls[_ball.id].position.toJSON());
            //physicBalls[_ball.id].wakeUp();
            const objChange = changes.reduce((acc, current)=>{
                acc[current.field] = current.value;
                return acc;
            },{});
            visualBalls[_ball.id].setPosition(objChange);
            Object.assign(physicBalls[_ball.id].body.position, room.state.balls[_ball.id].position);
            Object.assign(physicBalls[_ball.id].body.velocity, room.state.balls[_ball.id].velocity);
            Object.assign(physicBalls[_ball.id].body.angularVelocity, room.state.balls[_ball.id].angularVelocity);
            Object.assign(physicBalls[_ball.id].body.quaternion, room.state.balls[_ball.id].quaternion);
            control.setPosition(physicBalls[_ball.id].body.position);
        }
    };

    const gamePlayState = {idle:true, shoots:0, shootStartTime:null, started:false, localStartTime:0, finished:false};
    const initialPlayerPosition = new Vector3(...courseDefinition.parts.find((part:any)=>part.type === "spawn").position);
    const visualCourse = createVisualCourse(parent, {courseDefinition});

    const control = createShootControl(parent, {
        position: new Vector3(...ballSpawnDefinition.position),
        rotation: new Quaternion(...ballSpawnDefinition.rotation),
        golfclub:{
            power:5,
            control:5,
            aim:5,
            id:"2"
        },

      //  hideGolfclub:true
    });
    const checkpoints = courseDefinition.parts.filter(part=>part.type === "checkpoint");
    const visualCheckpoints = checkpoints.map((checkpoint, index) => {
        return createCheckpoint(parent, {
            position:new Vector3(...checkpoint.position),
            visible:index===0 //TODO instead of visible, maybe just have 1 checkpoint and move it, make non visible when last
        });
    });
    console.log("checlpoint", checkpoints);
    console.log("visualCheckpoints, ", visualCheckpoints)

    room.onMessage(MESSAGE.CHECKPOINT,({checkpoint, index})=>{
        console.log("checkpoint", checkpoint, index);
        reproduceAvatarSound("checkpoint");
        if(index === (checkpoints.length-1)){
            visualCheckpoints[index].dispose();
        }else{
            visualCheckpoints[index].dispose();
            visualCheckpoints[index+1].show();
        }
    });

    room.onLeave((code)=>{
        visualCheckpoints.forEach(c=>c.dispose());
    });

    movePlayerTo({
        x:initialPlayerPosition.x+24,
        y:initialPlayerPosition.y,
        z:initialPlayerPosition.z+24
    }, { x: 8+24, y: 1, z: 8+24 });
   
    room.onMessage(MESSAGE.PONG, (serverTime)=>{
        lastPing = (Date.now() - lastPingTime) / 2;
        pingText.value = lastPing;
        serverTimeOffset = Date.now()-serverTime;
        room.send(MESSAGE.PING2);
        console.log("serverTimeOffset2",serverTimeOffset)
    });
    room.onMessage(MESSAGE.START, ({startTime, duration, serverTime})=>{//TODO duplicated code, abstract to service
        serverTimeOffset = Date.now()-serverTime;
        gamePlayState.localStartTime = startTime - serverTimeOffset;
        control.show();
        console.log("serverTimeOffset",serverTimeOffset, serverTime);
    });

    room.onMessage(MESSAGE.SLEEP, ()=>{
        console.log("SLEEP");
        control.show();
        control.setPosition(visualBalls[myBallId].getPosition());
    });

    room.onMessage(MESSAGE.OUT, ()=>{
        console.log("OUT");
       /* setTimeout(100, ()=>{
            control.show();
            control?.setPosition(physicBalls[myBallId].body.position);
            physicBalls[myBallId].body.sleep();
            visualBalls[myBallId].setPosition(
                physicBalls[myBallId].body.position,
                physicBalls[myBallId].body.quaternion
            );
        })*/
    });

    const actionUI = new UIContainerRect(getCanvas());
    actionUI.vAlign = "top";
    actionUI.hAlign = "right";
    actionUI.positionX = - 200;
    actionUI.width = actionUI.height = 60;
    actionUI.color = Color4.Gray();
    actionUI.opacity = 0.5;
    const pingText = new UIText(actionUI);
    pingText.value = "";


    control.onShoot(async ({impulse, delayMs}) => {//delayMs is golfclub animation
        console.log("SHOOT");
        //actionUI.color = Color4.Red();
        //control.hide();
        room.send(MESSAGE.SHOOT, {impulse, timeStep, delayMs});
        setTimeout(Math.max(0, 200-lastPing), ()=>{
            physicBalls[myBallId].body.wakeUp();
        })
    });


    let pingInterval = setInterval(()=>{//TODO move to update with (% count)
        lastPingTime = Date.now();
        room.send(MESSAGE.PING);        
    }, 5000);

    const updateSystem = new UpdateSystem((dt)=>{
        const time = Math.max(0,Date.now() - gamePlayState.localStartTime);
        if(gamePlayState.finished ){
            return;
        }

        if(!gamePlayState.started){
            if(gamePlayState.localStartTime <= Date.now()){
                gamePlayState.started = true;
                topBar.show();
                topBar.updateTime(0, true);
            }
        }else{
            topBar.updateTime(time, true);
        }
        update(dt)

    });

    return {
        dispose:()=>{
        },
        onFinish:(fn)=>{
            callbacks.onFinish = fn;
        }
    };

    function update(dt:number){
        let numFrames = Math.floor(dt/timeStep);
        while(numFrames--){
            world.step(timeStep, timeStep);
        }

        Object.keys(visualBalls).forEach(ballId => {
            visualBalls[ballId].setPosition(
                physicBalls[ballId].body.position,
                physicBalls[ballId].body.quaternion
            );
        });
        if(!physicBalls[myBallId]) return;
        control?.setPosition(physicBalls[myBallId].body.position);
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
    }
}
