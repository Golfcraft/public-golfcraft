"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.creatServerGolfPlay = void 0;
const world_1 = require("../../scene/golfplay/physics/world");
const ball_1 = require("../../scene/golfplay/physics/ball");
const course_element_loader_1 = require("../../scene/golfplay/physics/course-element-loader");
const gameplay_handler_1 = require("../../scene/golfplay/src/gameplay-handlers/gameplay-handler");
const FIXED_TIME_STEPS = (1.0 / 300.0);
const MAX_TIME_STEPS = 100;
exports.creatServerGolfPlay = ({ gameDefinition, courseDefinition }) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("createServerGolfPlay courseDefinition", gameDefinition, courseDefinition);
    const callbacks = {
        onFinish: null,
        onUpdate: null,
        onEvent: null
    };
    const ballSpawnDefinition = courseDefinition.parts.find((part) => part.type === "initial_position");
    const { world } = world_1.createPhysicsWorld();
    const physicBall = ball_1.createPhysicBall(world, { position: ballSpawnDefinition.position });
    let positionBeforeShoot;
    console.log("loading coursePhysics from def", gameDefinition.courseId);
    const physicParts = course_element_loader_1.loadCoursePhysics(world, { courseDefinition });
    const movingPhysicParts = Object.values(physicParts).filter((pp) => pp.definition.animation).reduce((acc, current) => {
        acc[current.definition.id] = current;
        current.animationState = { currentFrame: 0, count: 0 };
        return acc;
    }, {});
    console.log("loaded coursePhysics", physicParts);
    const gamePlayState = { idle: true, finished: false }; //TODO move to coly State?
    const gameHandler = gameplay_handler_1.createGameHandler({
        gameType: gameDefinition.type,
        world,
        ballBody: physicBall.body,
        state: gamePlayState,
        courseDefinition,
        movingPhysicParts
    });
    gameHandler.onEvent("OUT", ({ data }) => {
        if (!positionBeforeShoot)
            throw new Error("REVIEW BUG");
        physicBall.body.position = positionBeforeShoot.clone();
        physicBall.body.sleep();
        gamePlayState.idle = true;
        callbacks.onEvent && callbacks.onEvent({ type: "OUT", data });
    });
    gameHandler.onEvent("SLEEP", ({ data }) => {
        physicBall.body.sleep();
        gamePlayState.idle = true;
        callbacks.onEvent && callbacks.onEvent({ type: "SLEEP", data });
    });
    gameHandler.onEvent("ANIMATION_FRAME_KINEMATICS", ({ data }) => {
        gameHandler.applyPartAnimationFrame({ data });
        callbacks.onEvent && callbacks.onEvent({ type: "ANIMATION_FRAME_KINEMATICS", data });
    });
    if (gameDefinition.type === "training") {
        //TODO not handling onFinish here?
        if (gameDefinition.subType === "1") {
            gameHandler.onEvent("CHECKPOINT", ({ type, data }) => {
                callbacks.onEvent({ type: "CHECKPOINT", data });
            });
        }
        else if (gameDefinition.subType === "2") {
            gameHandler.onEvent("ZONE", ({ type, data }) => {
                callbacks.onEvent({ type: "ZONE", data });
            });
            //TODO REVIEW OUT already defined above
            /* gameHandler.onEvent("OUT", ({type, data})=>{
               callbacks.onEvent("OUT");
           }); */
        }
        else if (gameDefinition.subType === "3") {
            gameHandler.onEvent("VOXTER", ({ type, data }) => {
                callbacks.onEvent({ type: "VOXTER", data });
            });
        }
        else if (gameDefinition.subType === "4") {
            gameHandler.onEvent("HOLE", ({ type, data }) => {
                gamePlayState.finished = true;
                callbacks.onEvent({ type: "HOLE", data });
            });
        }
    }
    else if (gameDefinition.type === "competition") {
        gameHandler.onEvent("HOLE", ({ type, data }) => {
            console.log(`gameHandler.onEvent("HOLE"`, { type, data });
            gamePlayState.finished = true;
            console.log("HOLE!!!", callbacks.onFinish);
            callbacks.onEvent && callbacks.onEvent({ type: "HOLE", data });
            callbacks.onFinish && callbacks.onFinish();
            //TODO callbaks.onEvent("HOLE") --> 
            //TODO + REVIEW: not call onFinish from here, never, delete onFinish?                
        });
    }
    var lastTime = Date.now() / 1000;
    const STEPS_FPS = 60 * 3;
    const FRAME_SPEED = 1;
    const timeStep = 1 / STEPS_FPS;
    var cannonInterval;
    /* cannonInterval = setInterval(()=>{
        var now = Date.now() / 1000;
        var timeSinceLastCall = now - lastTime;
        
        world.step(timeStep*FRAME_SPEED, timeSinceLastCall*FRAME_SPEED);
        lastTime = now;
    }, 30);  */
    function getFrames(frameTime) {
        const frames = [];
        let i = 0;
        console.time("getFrames");
        while (true) {
            world.step(frameTime);
            gameHandler.update(frameTime);
            const { position, velocity } = physicBall.body;
            frames.push({ position: { x: position.x, y: position.y, z: position.z }, velocity: { x: velocity.x, y: velocity.y, z: velocity.z } });
            if (gamePlayState.idle) {
                console.timeEnd("getFrames");
                console.log("frames", frames.length);
                return frames;
            }
            i++;
        }
    }
    function update(dt) {
        //world.step(timeStep*FRAME_SPEED, dt*FRAME_SPEED);        
        gameHandler.update(dt);
        triggerBallUpdate();
    }
    return {
        getFrames,
        shoot,
        update,
        onFinish: (fn) => {
            callbacks.onFinish = fn;
        },
        onUpdate: (fn) => {
            callbacks.onUpdate = fn;
            triggerBallUpdate();
        },
        onEvent: (fn) => {
            callbacks.onEvent = fn;
        },
        dispose,
        getPhysicsParts: () => physicParts
    };
    function dispose() {
        clearInterval(cannonInterval);
        gameHandler.dispose();
        callbacks.onFinish = null;
        callbacks.onUpdate = null;
        callbacks.onEvent = null;
    }
    function shoot({ impulse }) {
        gamePlayState.idle = false;
        positionBeforeShoot = physicBall.body.position.clone();
        const { x, y, z } = impulse;
        physicBall.wakeUp();
        physicBall.applyImpulse(new CANNON.Vec3(x, y, z), physicBall.body.position);
    }
    function triggerBallUpdate() {
        //if(gamePlayState.idle) return;
        const { position, angularVelocity, quaternion, velocity } = physicBall.body;
        callbacks.onUpdate && callbacks.onUpdate({
            ball: {
                position,
                angularVelocity,
                quaternion,
                velocity
            }
        });
    }
});
