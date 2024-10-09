export enum EVENT {
    ANY,
    SLEEP,
    ZONE,
    OUT,
    HOLE,
    CHECKPOINT,
    VOXTER,
    SAND,
    WIND,
    EXPLOSIVE,
    EVENT_VARIABLE_CHANGE,
    CLIENT_LOG
}

export const EVENT_NAME = {
    [EVENT.ANY]:"ANY",
    [EVENT.SLEEP]:"SLEEP",
    [EVENT.ZONE]:"ZONE",
    [EVENT.OUT]:"OUT",
    [EVENT.HOLE]:"HOLE",
    [EVENT.CHECKPOINT]:"CHECKPOINT",
    [EVENT.VOXTER]:"VOXTER",
    [EVENT.SAND]:"SAND",
    [EVENT.WIND]:"WIND",
    [EVENT.EXPLOSIVE]:"EXPLOSIVE",
    [EVENT.EVENT_VARIABLE_CHANGE]:"EVENT_VARIABLE_CHANGE"
}
// GameplayHandler receives an environment, handles physic world and emit events

export type GameplayHandler = (world:any, gameEvents:any, options:any)=>{
    update:(dt?:number, onlyAnimations?:boolean, isSimulation?:boolean)=>void,
    onEvent:(fn:Function)=>any
}