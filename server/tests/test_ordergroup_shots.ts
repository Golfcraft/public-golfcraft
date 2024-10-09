import {expect} from "chai";
import 'mocha';

import {
    CompetitionGroupRoomRepresentation,
    checkForFinishedGroups,
    getGroups,
    getGroupWinners,
    interval
} from "../competition-groups/competition-groups-main"

it('Group ordered by number of shots', function(done) {

    const shot = {
        date: 11,
        impulse: 0
    }

    const player1 = createPlayer([shot, shot, shot], 20, "1")
    const player2 = createPlayer([shot], 20, "2")
    const player3 = createPlayer([shot, shot], 20, "3")

    const group: CompetitionGroupRoomRepresentation = {
        id: "#000",
        finished: false,
        courseId: "1-2",
        players:{
            1: player1,
            2: player2,
            3: player3
        }
    }

    const g:{[id:string]:CompetitionGroupRoomRepresentation} = getGroups()
    g[0] = group

    const ordered_group = getGroupWinners({"groupId": 0});

    expect(ordered_group[0].displayName).to.equal("2");
    expect(ordered_group[1].displayName).to.equal("3");
    expect(ordered_group[2].displayName).to.equal("1");

    /*expect(getGroups()).to.equal(g);

    const ordered_group = getGroupWinners({"groupId": 0});

    console.log("ordered_group", ordered_group);

    checkForFinishedGroups ();

    console.log("getGroups", getGroups());*/

    clearInterval(interval)

    done();
});


function createPlayer(shots:Array<any>, holetime: number, displayname: string) {
    return {
        userId: "usr1",
        lobbySessionId: "ls1",
        realm: "loki",
        displayName: displayname,
        startTime: 10,
        shoots: shots,
        holeTime: holetime,
        PlayFabId: displayname
    }
}
