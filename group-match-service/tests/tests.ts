import { expect } from 'chai';
import {getGroupMatchForPlayer} from "../src/group-matcher";
import {CompetitionGroupRoomRepresentation, GroupMap} from "../src/Groups.d";
import { getRandomInt } from '../../common/utils';

describe(`getGroupMatchForPlayer`, ()=>{
    it(`should return null when assignable groups are less than bufferLength`, ()=>{
        const groups:GroupMap = getAssignableGroupMap(2);
        const player = getMockPlayer("foo");
        expect(getGroupMatchForPlayer({userId:player.userId, groups, bufferLength:3})).to.equal(null);
    });

    describe("with fullfilled buffer", ()=>{
        it(`should return null if assignable groups has players with own userId`, ()=>{
            const groups:GroupMap = getAssignableGroupMap(2);
            const userId = "foo";
            const mockPlayer = getMockPlayer("foo");
            delete groups[0].players.a;
            delete groups[1].players.a;
            groups[0].players[userId] = mockPlayer;
            groups[1].players[userId] = mockPlayer;
    
            expect(getGroupMatchForPlayer({userId, groups, bufferLength:2})).to.equal(null);
        })
    
        it("should return a group if bufferLength is the same than assignable groups", () => {
            const groups:GroupMap = getAssignableGroupMap(3);
            const player = getMockPlayer("foo");
    
            expect(getGroupMatchForPlayer({userId:player.userId, groups, bufferLength:3})).not.to.equal(null);
        });

        it("should return a group if bufferLength is lower than assignable groups", () => {//null = create new group
            const groups:GroupMap = getAssignableGroupMap(3);
            const player = getMockPlayer("foo");
    
            expect(getGroupMatchForPlayer({userId:player.userId, groups, bufferLength:2})).not.to.equal(null);
        });
    });
    

    it("should return closer group regarding competition_points", () => {
        const groups:GroupMap = getAssignableGroupMap(3, [100, 200, 300]);
        const player = getMockPlayer("foo");

        expect(
            getGroupMatchForPlayer({userId:player.userId, groups, bufferLength:3, competition_points:201})
        ).to.equal(groups[1]);
    });
});

function getAssignableGroupMap(length = 2, competition_points?:number[]){
    return Array(length).fill(null).reduce((acc, current, index)=>{
        acc[index.toString()] = getMockGroup(index.toString(), {
            "a":getMockPlayer("a"),
            "b":getMockPlayer("b")   
        }, competition_points?.[index]);
        return acc;
    },{})
}

function getMockGroup(id = Math.random().toString(), players = {}, competition_points = 0):CompetitionGroupRoomRepresentation{
    return {
        courseId:"course-mock",
        id,
        players,
        competition_points
    }
}

function getMockPlayer(userId){
    return {
        userId:userId,
        server:"TEST",
        displayName:capitalize(userId),
        startTime:0,
        PlayFabId:Math.random().toString()
    }    
}

const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  }