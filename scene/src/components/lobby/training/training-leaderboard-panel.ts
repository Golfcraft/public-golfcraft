import {globalStore} from "../../../services/globalStore/globalStore";
import {createTextShapeTable} from "../../../../TextShapeTable";
import { compose, pipe } from "../../../../../common/utils";
import { refreshLeaderboard } from "../../../services/userData";
import {getGLTFShape} from "../../../../golfplay/services/resource-repo";
const boardShape = getGLTFShape(`models/board.glb`);
const identity = (value)=>value;
const createTrainingLeaderboardPanel = (parent, {position, rotation, title, StatisticName, formatValueFn = identity}) => {
    const entity = new Entity();
    entity.setParent(parent);
    entity.addComponent(new Transform({
        position,
        rotation
    }));
    const board = new Entity();
    board.setParent(entity);

    board.addComponent(boardShape);
    /*board.addComponent(new Transform({
        position: new Vector3(0,-0.5,0)
    }));*/
    const state = {
        ownValue:globalStore.userData.getState()[`statistic_${StatisticName}`],
        lastTimeRefresh:0
    };
    board.addComponent(new OnPointerDown(()=>{
        if(state.lastTimeRefresh + 1000 > Date.now()) return;
        state.lastTimeRefresh = Date.now();
        refreshLeaderboard(StatisticName);
    }, {
        hoverText:'refresh'
    }))
    globalStore.userData.onChange(({newValue, oldValue, prop})=>{
        state.ownValue = globalStore.userData.getState()[`statistic_${StatisticName}`]
    });
    const processData = pipe(mapIndex, sliceLimitAndPutOwn, fromLeaderboardToRows);

    const table = createTextShapeTable(entity, entity, {
        entity:{ position: new Vector3(-1.8,3.6,0) },
        text:{
            font: Fonts.SanFrancisco,
            fontSize:2,
            color: new Color3(1,1,0.5)
        },
        columns:[
            {
                width:3.45,
                text:{
                    hTextAlign:'left'
                }
            },{
                width:0.3,
                text:{
                    hTextAlign:'right'
                }
            }
        ],
        data:[
            [title, ""],
            ...processData(globalStore.leaderboards && globalStore.leaderboards[StatisticName])
        ]
    });


    globalStore.leaderboards.onChange(({newValue, oldValue, prop}) => {
        table.updateData(processData(newValue));
    }, StatisticName);

    const show = () => {};
    const hide = () => {};

    return {
        show,
        hide,
        refresh:()=>refreshLeaderboard(StatisticName)
    }
    function sliceLimitAndPutOwn(data){
        if(!data) return;
        const newData = JSON.parse(JSON.stringify(data.slice(0,10)));
        if(newData[9] && newData[9].StatValue > state.ownValue){
            newData[9].index = " ";
            newData[9].StatValue = state.ownValue;
            newData[9].DisplayName = globalStore.userData.getState().user?.displayName;
        }

        return newData;
    }

    function mapIndex(data){
        if(!data) return;
        return data.map((i,index)=>({...i,index:index+1}));
    }

    function fromLeaderboardToRows(data){
        if(!data?.length) return [["",""]];

        return [
            [title, ""],
            ...data.map((item, index) => ([
                `${item.index} ${item.DisplayName}`, formatValueFn(item.StatValue)
            ]))
        ];
    }
};

export {
    createTrainingLeaderboardPanel
};
