type Callbacks = {
    [key:string]:Function[]
};

enum EVENT {
    ANY
}

const createEventManager = () => {
    let callbacks:Callbacks = {
        [EVENT.ANY]:[]
    };
    let disposed = false;
    let enabledEvents = true;
    return {
        onEvent:(type,fn) => {
            if(disposed) return;
            callbacks[type] = callbacks[type] || [];       
            const eventCallbacks = callbacks[type]
            eventCallbacks.push(fn);
            return () => eventCallbacks.splice( eventCallbacks.indexOf(fn), 1 );
        },
        trigger:(event:{type:string|number, data:Object}) => {
            if(disposed) return;
            callbacks[EVENT.ANY]?.length && callbacks[EVENT.ANY].forEach((fn:Function)=>fn(event));
            callbacks[event.type]?.length && callbacks[event.type].forEach((fn:Function)=>fn(event));
        },
        dispose:()=>{
            disposed =true;
            callbacks = {};
        },
        disableEvents:()=>{

        },
        enableEvents:()=>{

        }
    }
};

export {
    createEventManager
};