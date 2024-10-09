const TIME_OFFSET = 0;
export function getFrames({startTime, world, amountS, timeStep, balls, reset, fps}){
    const frames = [];
    const _balls = reset && Object.keys(balls).reduce((acc, ballId)=>{
        const ball = balls[ballId];
        acc.push({
            id:ball.id,
            position:ball.body.position.clone(),
            velocity:ball.body.velocity.clone(),
            quaternion:ball.body.velocity.clone(),
            angularVelocity:ball.body.angularVelocity.clone(),
            vlambda:ball.body.vlambda.clone(),
            wlambda:ball.body.wlambda.clone(),
            interpolatedPosition:ball.body.interpolatedPosition.clone(),
            invInertiaWorldSolve_elements:[...ball.body.invInertiaWorldSolve.elements],
            world_time:world.time,
            world_stepnumber:world.stepnumber
        });
        return acc;
    }, []);
    let stepTime = performance.now();
    let processingTime = 0;
    let lastInsertedFrameTime = 0;
    let steps= 0;
    while((timeStep*frames.length) < amountS){
        world.step(timeStep, timeStep);
        const t = startTime + Math.floor(timeStep * steps * 1000) + TIME_OFFSET;
        if(t - lastInsertedFrameTime > 1000/fps){
            frames.push({
                t,
                balls:Object.values(balls).map((physicBall:any) => {
                    const {position, velocity, quaternion, vlambda, angularVelocity, interpolatedPosition, wlambda, invInertiaWorldSolve_elements, world_time, world_stepnumber} = physicBall.body
                    return {
                        id:physicBall.id,
                        position:{x:position.x, y:position.y, z:position.z},
                        velocity:{x:velocity.x, y:velocity.y, z:velocity.z},
                        quaternion:{x:quaternion.x, y:quaternion.y, z:quaternion.z, w:quaternion.w},
                        angularVelocity:{x:angularVelocity.x, y:angularVelocity.y, z:angularVelocity.z},
                        vlambda:{x:vlambda.x, y:vlambda.y, z:vlambda.z},
                        wlambda:{x:wlambda.x, y:wlambda.y, z:wlambda.z},
                        interpolatedPosition:{x:interpolatedPosition.x, y:interpolatedPosition.y, z:interpolatedPosition.z}
                    }
                })
            });
            lastInsertedFrameTime = t;
        }
        steps++;

        processingTime = performance.now()-stepTime;
    }

    if(reset){
        _balls.forEach(_ball => {
            assignCoords(balls[_ball.id].body.position, _ball.position);
            assignCoords(balls[_ball.id].body.velocity, _ball.velocity);
            assignCoords(balls[_ball.id].body.quaternion, _ball.quaternion);
            assignCoords(balls[_ball.id].body.angularVelocity, _ball.angularVelocity);
             assignCoords(balls[_ball.id].body.vlambda, _ball.vlambda);
             assignCoords(balls[_ball.id].body.wlambda, _ball.wlambda);
             assignCoords(balls[_ball.id].body.interpolatedPosition, _ball.interpolatedPosition);

             balls[_ball.id].body.invInertiaWorldSolve.elements = [..._ball.invInertiaWorldSolve_elements];
             world.time = _ball.world_time;
             world.stepnumber = _ball.world_stepnumber;
        });
    }

    return frames;
}

function assignCoords(a,b){
    a.x = b.x;
    a.y = b.y;
    a.z = b.z;
    if(b.w) a.w = b.w;
}

