import {getRandomInt} from "../../../common/utils";

const repo = {
    "1":{
        id:"1",
        power:0,
        control:2,
        aim:1               
    },
    "2":{
        id:"2",
        power:1,
        control:2,
        aim:0
    },
    "3":{
        id:"3",
        power:3,
        control:0,
        aim:0
    }
}

export const getRandomGolfClub = () => {
    const id = getRandomInt(1,3);
    return repo[id];
}