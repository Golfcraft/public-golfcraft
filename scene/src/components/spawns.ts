export type Spawn = [{x:number,y:number,z:number},{x:number,y:number,z:number}];
export const GAME_SPAWN = {
    TOURNAMENT:[{ x:31,y:11,z:34},{ x:12, y:11, z:28} ] as Spawn,
    COMPETITION:[{ x:20.94+Math.random(),y:9.21,z:32.07+Math.random()}, { x:24.31, y:9.31, z:32.44} ] as Spawn,
    TRAINING:[{ x:14.89+Math.random(), y:3, z:38.82+Math.random()},{ x:14.53, y:3, z:41.38}] as Spawn,
    EDITOR:[{x:15+Math.random(),y:35,z:25+Math.random()},{x:15,y:35,z:26}] as Spawn,
    MISSION:[{x:34+Math.random(),y:3,z:36+Math.random()},{x:28,y:2,z:31}] as Spawn
}
