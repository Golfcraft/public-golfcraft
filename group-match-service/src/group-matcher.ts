import { MAX_PER_GROUP } from "../../common/constants";
import {CompetitionGroupRoomRepresentation, GroupMap} from "./Groups.d";

export const getGroupMatchForPlayer = ({userId, competition_points = 0, groups, bufferLength}) => {
    const assignableGroups:CompetitionGroupRoomRepresentation[] = Object.values(groups as GroupMap)
                            .filter(group=>isAssignableGroup(group, userId));

    if(assignableGroups.length < bufferLength){
        return null;
    } else {
       const assignableGroupPoints:number[] = assignableGroups.map(g=>g.competition_points||0);
       const differencePoints:number[] = assignableGroupPoints.map(p=>Math.abs(p-competition_points));
       const lowerDifferenceIndex:number = getLowerValueIndex(differencePoints);

       return assignableGroups[lowerDifferenceIndex];
    }
}

function isAssignableGroup(group, userId){
    return Object.keys(group.players).length < MAX_PER_GROUP && !group.players[userId];
}

function getLowerValueIndex(nums:number[]){
    let value = Number.MAX_SAFE_INTEGER;
    let i = nums.length;
    while(i--){
        if(nums[i] < value) value = nums[i]
    }
    return nums.indexOf(value);
}