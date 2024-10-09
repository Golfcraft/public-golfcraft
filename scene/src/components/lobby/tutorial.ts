import { getTextOfJSDocComment, isConstructorDeclaration } from "typescript";
import {createDemoGolfPlay} from "../../../golfplay/src/golfplay-demo";
import { getGLTFShape } from "../../../golfplay/services/resource-repo";
import {migrateCourseDefinitionAnimations} from "../../../../common/course-animations-migration";
import {getCourseDefinition} from "../../../../common/course-definitions/course-definition-repository";

var demoGolfPlay;
var landData;
var ballPosition: Vector3;
var targets: Array<Entity> = [];
var currentText = "";
var shoots: number = 0;
var last_ball_position: {x: number, y:number, z:number};
var target_attempts: number = 0;

const target_positions = [
    [20.68, 12.28],
    [13.13, 18.36],
    [11.36, 33.69],
    [26.43, 36.40]
]

const target_hits: Array<boolean> = [
    false,
    false,
    false,
    false
]

var state_machine_step: String = "start"

var root = new Entity()
engine.addEntity(root)
let updateSystem

const targetGLTF = getGLTFShape(`golfplay/models/zone.gltf`);

// console.log("TUTORIAL: ", targetGLTF)
import democourse from "../../../../common/course-definitions/democourse";
async function create() {
    const {position, rotation, scale, serverWs, pfTitleId, pfProjectId, showDebug, pfSpecificRevision, serverUrl} = JSON.parse(landData.host_data).golfcraftgame;
    const {x,y,z} = position;
    
    root.addComponentOrReplace(new Transform({
        position:new Vector3(x,y,z)
    }));

    demoGolfPlay = await createDemoGolfPlay(root, {gameDefinition:{courseDefinition:democourse}})
    demoGolfPlay.setPositionCallback(async (pos: Vector3) => {
        ballPosition = pos;
    });

    demoGolfPlay.setShootCallback(async (_shoots: number) => {
        shoots = _shoots;
        target_attempts += 1;
        updateText();
    });

    updateSystem = new UpdateSystem();
    engine.addSystem(updateSystem);

    for (let n=0; n<target_positions.length; n++) {
        const t = new Entity();
        t.addComponent(targetGLTF);
        t.addComponent(new Transform({
            position: new Vector3(target_positions[n][0], 1.2, target_positions[n][1])
        }))
        if (!target_hits[n]) {
            engine.addEntity(t);
        }
        targets.push(t);
    }
}


export const createTutorial = (_landData) => {
    landData = _landData;
    showTutorial();
}


export function hideTutorial(){
    engine.removeSystem(updateSystem);
    demoGolfPlay.dispose();
    engine.removeEntity(root);
    targets.forEach((t)=>engine.removeEntity(t));
    targets = [];
}


export function showTutorial(){
    engine.addEntity(root);
    create().then(()=>updateText())
}

class UpdateSystem implements ISystem {
    update(dt:number){
        const user_pos = Camera.instance.position;
        const distance = ballPosition.subtract(user_pos).length();
        //console.log(user_pos, ballPosition, distance);
        if (distance > 4) {
            demoGolfPlay.hideControl(true);
            demoGolfPlay.setText("Come here!");
        } else {
            demoGolfPlay.hideControl(false);
            demoGolfPlay.setText(currentText);
        }
        for (let n=0; n<targets.length; n++) {
            if (state_machine_step == "start" && n!=0) continue;
            if (state_machine_step == "hole_2" && n!=1) continue;
            if (state_machine_step == "hole_3" && n!=2) continue;
            const target_pos = targets[n].getComponent(Transform).position;
            const t_distance = ballPosition.subtract(target_pos).length();
            if (t_distance<1) {
                engine.removeEntity(targets[n]);
                target_hits[n] = true;
            }
        }
    }
}

function updateText() {
    //const any_hit = target_hits.indexOf(true) > -1;
    
    // Update state machine
    if (state_machine_step == "start") {
        if (target_hits[0]) {
            state_machine_step = "hole_2"
            last_ball_position = demoGolfPlay.getBallPosition()
            target_attempts = 0
        }
    } else if (state_machine_step == "hole_2") {
        if (target_hits[1]) {
            state_machine_step = "hole_3"
            last_ball_position = demoGolfPlay.getBallPosition()
            target_attempts = 0
        }
    } else if (state_machine_step == "hole_3") {
        if (target_hits[2]) {
            state_machine_step = "hole_4"
            last_ball_position = demoGolfPlay.getBallPosition()
            target_attempts = 0
        }
    } else if (state_machine_step == "hole_4") {
        if (target_hits[3]) {
            state_machine_step = "end"
            last_ball_position = demoGolfPlay.getBallPosition()
            target_attempts = 0
        }
    }

    if (state_machine_step == "start") {
        const attempts2text = [
            "Use E and F to set the Power,\nclick to hit the ball.",
            "Don't worry\nIncrease the Power with E to reach the target.",
            "Let's try one more time\nUse E and F to set the Power,\nclick to hit the ball."
        ]
        currentText = target_attempts < attempts2text.length ? attempts2text[target_attempts] : attempts2text[0];
        if (!target_hits[0]) {
            demoGolfPlay.setPower(5);
            demoGolfPlay.setBallPosition(
                5.213054656982422,
                1.3073450326919556,
                -11.32984447479248
            );
        }
    } else if (state_machine_step == "hole_2") {
        const attempts2text = [
            "Use E and F to Aim,\nclick to set the Power.",
            "E rotates counter clock wise,\nand F rotates clock wise.",
            "You can do it! Aim at the second target!",
            "The second target is the one\nclosest to the initial position."
        ]
        currentText = target_attempts < attempts2text.length ? attempts2text[target_attempts] : attempts2text[0];
        if (target_attempts == 0) currentText = "Nice!\n" + currentText;
        if (!target_hits[1]) {
            demoGolfPlay.setPower(5);
            demoGolfPlay.setBallPosition(last_ball_position.x, last_ball_position.y, last_ball_position.z);
            demoGolfPlay.disableRotation(false);
        }
    } else if (state_machine_step == "hole_3") {
        const attempts2text = [
            "Press E and F at the same time\nto switch back to Aim from Power.",
            "You need to switch to Power\nto be able to press E and F at the same time.",
            "Tough position huh?",
            "You can do it! We have all the timein the world.",
        ]
        currentText = target_attempts < attempts2text.length ? attempts2text[target_attempts] : attempts2text[0];
        if (target_attempts == 0) currentText = "Excellent!\n" + currentText;
    } else if (state_machine_step == "hole_4") {
        const attempts2text = [
            "Last target!",
            "Show me what you've learned!",
            "Only one target to go!"
        ]
        currentText = target_attempts < attempts2text.length ? attempts2text[target_attempts] : attempts2text[0];
        if (target_attempts == 0) currentText = "Good work!\n" + currentText;
    }  else if (state_machine_step == "end") {
        currentText = "Congrats!\nYou've completed the tutorial!\nYou can now go play on Training.";
    } 
}

const itemCounter = (array, item) => {
    return array.filter((currentItem) => currentItem == item).length;
};