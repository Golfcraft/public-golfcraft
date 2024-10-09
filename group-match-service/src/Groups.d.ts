export type Shoot = {
    date:number,//ms
    impulse
};

export type GroupMap = {
    [key:string]:CompetitionGroupRoomRepresentation
};

export type CompetitionGroupPlayer = {
    userId:string,
    lobbySessionId?:string,
    server:string,
    displayName:string,
    startTime:number,
    shoots?:Shoot[],
    holeTime?:number,
    PlayFabId:string
};

export type CompetitionGroupRoomRepresentation = {
    id:string,
    finished?:boolean,
    courseId:string,
    players:{
        [userId:string]:CompetitionGroupPlayer
    },
    competition_points?: number
}
