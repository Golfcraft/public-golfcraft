import { createTextShapeTable } from "../../../../TextShapeTable";
import MESSAGE from "../../../../../server/rooms/mesages";
import { reproduceAvatarSound } from "../../../services/avatar-sound";
import { globalStore } from "../../../services/globalStore/globalStore";
import { getLobbyRoom } from "../../../services/lobbyRoom";
import { refreshCompetitionGroupList } from "../../../services/userData";
import {getGLTFShape} from "../../../../golfplay/services/resource-repo";

const createCompetitionListPanel = (parent, {position, rotation}) => {
    const state = {
        currentPage:0,
        pages:[
            [
                ["Group","time","shoots"],
                ["-","-","-"],
                ["","",""],
                ["","","0/0"]
            ]
        ],
        groupIds:[""],
        empty:true
    };
    const entity = new Entity();
    entity.addComponent(new Transform({
       position,
       rotation
    }));

    entity.setParent(parent);

    const board = new Entity();
    board.setParent(entity)
    const boardShape =  getGLTFShape(`models/board.glb`);
    board.addComponent(boardShape);

    const table = createTextShapeTable(entity, entity, {
        entity:{
            position: new Vector3(-1.8, 3.6, -0.05),
            rotation:Quaternion.Euler(0,0,0),
        },
        text:{
            font: Fonts.SanFrancisco
        },
        data:state.pages[state.currentPage],
        columns: [
            {
                width:1.5,
                text:{
                    fontSize:2,
                    hTextAlign:'left',
                    color: Color3.White()
                }
            },{
                width:0.8,
                text:{
                    fontSize:2,
                    hTextAlign:'right',
                    color: Color3.White()
                }
            },{
                width:0.8,
                text:{
                    fontSize:2,
                    hTextAlign:'right',
                    color: Color3.White()
                }
            }
        ]
    });
    const updateTableData = (data, groupIds) => {
        state.pages = data;
        state.groupIds = groupIds;
        if(!data?.length){
            table.updateData([
                ["No pending competition groups","",""],
            ]);
            state.empty = true;
            return;
        }
        table.updateData([
            ["PENDING GROUPS","",""],
            ["","",""],
            [`#${state.groupIds[state.currentPage]}`,"time","shots"],
            ...data[state.currentPage],
            ["","",""],
            ["","",`${
                Math.min(state.currentPage+1, data.length)
            }/${data.length}`]
        ]);
        state.empty = data.length ? false : true;
    }

    const handler = new Entity();
    handler.setParent(entity);
    const plane = new PlaneShape();
    const material = new Material();
    material.albedoColor = new Color4(0, 0, 0, 0);
    handler.addComponent(new Transform({
        position:new Vector3(0,2.8,-0.05),
        scale:new Vector3(4,3,1)
    }));
    handler.addComponent(plane);
    handler.addComponent(material);
    handler.addComponent(new OnPointerDown(()=>{
        reproduceAvatarSound("button2");
        if(state.empty) return;
        state.currentPage++;

        if(state.currentPage > state.pages.length-1){
            state.currentPage = 0;
        }

        table.updateData([//TODO duplicated code
            ["PENDING GROUPS", "", ""],
            ["","",""],
            [`#${state.groupIds[state.currentPage]}`,"time","shots"],
            ...state.pages[state.currentPage],
            ["","",""],
            ["","",`${
                Math.min(state.currentPage+1, state.pages.length)
            }/${state.pages.length}`]
        ]);
    }, {hoverText:'Switch page/group'}))
    const reconnectableLobbyRoom = getLobbyRoom();
    const userId = globalStore.userData.getState().userId;

    reconnectableLobbyRoom.onMessage(MESSAGE.UPDATE_COMPETITION_GROUP, () => refreshCompetitionGroupList({userId}));
    reconnectableLobbyRoom.onMessage(MESSAGE.UPDATE_COMPETITION_GROUP_REWARDS, () => refreshCompetitionGroupList({userId}));

    globalStore.userData.onChange(
        ({newValue}) => {
            updatePlayedCompetitionGroupList(newValue);
        },
        "pendentGroups"
    );

    //TODO REVIEW: lobbySessionId mutates collection on server, correct way for a get?
    refreshCompetitionGroupList({userId, lobbySessionId:reconnectableLobbyRoom.sessionId});

    const show = ()=> {};
    const hide = () => {};

    return {
        show,
        hide,
        dispose
    };

    function dispose() {
        //TODO disposeDataListener && disposeDataListener();
    };

    function updatePlayedCompetitionGroupList(list){
        if(!list?.length){
            updateTableData([],[]);
            return;
        }

        const data = list.map(group=>{
            return Object.values(group.players)
                        .map(player=>[
                            player.displayName.substring(0,12) || '<Unknown>',
                            formatTimeSinceStart(player.startTime, player.holeTime) || "00:00",
                            player.shoots?.length || 0
                        ]).sort((rowA,rowB)=>{
                            if(rowA[1] === "99:99") return +1;
                            if(rowB[1] === "99:99") return -1;
                            if(rowA[2] === rowB[2]) return (rowA[1] < rowB[1] ? -1 : 1);

                            return rowA[2] - rowB[2];
                        })});
        updateTableData(data, list.map(group=>group.id+ ' '+ group.courseId.replace("competition-","")));

        function formatTimeSinceStart(startDate, endDate){
            if(!endDate) return `99:99`;
            const ms = endDate - startDate;
            const seconds = Math.floor(ms/1000);
            const minutes = Math.floor(seconds/60);
            const restSeconds = seconds % 60;
            const minutesStr = minutes < 10 ? `0${minutes}`:minutes;
            const secondsStr = restSeconds < 10 ? `0${restSeconds}`:restSeconds;

            return `${minutesStr}:${secondsStr}`;
        }
    }
}

export { createCompetitionListPanel };
