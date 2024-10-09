export function createFrameReproduction({
    frames,
    timeStep,
    onEvent,
    onUpdateBall,
    onFinish
}){
    let processedFrames = 0;
    let totalElapsed = 0;
    const state = {
        totalElapsed:0,
        processedFrames:0,
        disposed:false
    }

    return {
        update,
        dispose:()=>state.disposed = true
    };

    function update(dt){
            if(state.disposed) return;
            totalElapsed += dt;
            const lastFrameIndex = Math.min(
                Math.floor(totalElapsed/timeStep)-1,
                frames.length-1
            );
            let i = processedFrames;
            let frame:any = frames[lastFrameIndex];
            
            onUpdateBall(frame);
            while(i <= lastFrameIndex){
                frames[i].events?.forEach((event)=> onEvent(event));
                i++;
            }
            
            processedFrames = lastFrameIndex+1;
            if(lastFrameIndex === frames.length-1) onFinish();   
    }
}
