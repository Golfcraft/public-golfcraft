import { createState } from "../../../../state";
import { createTextShapeTable } from "../../../../TextShapeTable";
import { sleep } from "../../../../../common/utils";
import MESSAGE from "../../../../../server/rooms/mesages";
import { registerSound, reproduceAvatarSound } from "../../../services/avatar-sound";
import { globalStore } from "../../../services/globalStore/globalStore";
import { getLobbyRoom } from "../../../services/lobbyRoom";
import { refreshUserData } from "../../../services/userData";
import { createImageButton } from "../../imageButton";
import {getServerHttpURL} from "../../../services/connect/server-selection";
import {getGLTFShape} from "../../../../golfplay/services/resource-repo";

registerSound("ui_play_collectrewardmultiple_01");
registerSound("ui_play_collectrewardmultiple_02");
registerSound("ui_play_collectrewardsingle_01");
registerSound("ui_play_collectrewardsingle_02");


const createRewardsPanel = (parent, {position, rotation}) => {
    const entity = new Entity();
    const store = createState({
        currentPage:0,
        empty:true,//TODO: empty can be processed, it shouldn't be state
        pages:fromChestsToTableData(globalStore.userData?.getState()?.chests),//TODO can be processed, no need to store in state
        loading:false,
        section:0,
        chests:globalStore.userData.getState().chests,
        chestContent:null
    });
    const state = store.getState();
    let reconnectableLobbyRoom = getLobbyRoom();

    reconnectableLobbyRoom.onMessage(MESSAGE.UPDATE_COMPETITION_GROUP_REWARDS, () => {
        refreshUserData();
    });

    entity.setParent(parent);
    entity.addComponent(new Transform({
        position, rotation
    }));

    const board = new Entity();
    board.setParent(entity);
    const shape = getGLTFShape(`models/board.glb`);
    board.addComponent(shape);

    const table = createTextShapeTable(entity, entity, {
        entity:{
            position: new Vector3(-1.8, 3.6, -0.05),
            rotation:Quaternion.Euler(0,0,0),
        },
        text:{
            font: Fonts.SanFrancisco,
            fontSize:2,
            color: new Color3(1,1,0.5)
        },
        data:state.pages[state.currentPage],
        columns: getColumnsConfig()
    });

    const handler = new Entity();
    handler.setParent(entity);
    const plane = new PlaneShape();
    const material = new Material();
    material.albedoColor = new Color4(0, 0, 0, 0);
    handler.addComponent(new Transform({
        position:new Vector3(0,2.8,0.01),
        scale:new Vector3(4,3,1)
    }));
    handler.addComponent(plane);
    handler.addComponent(material);
    handleLoadingHoverText();
    handler.addComponent(new OnPointerDown(handlerCallback, {hoverText:'Switch page/group'}));

    const openChest = createImageButton(entity, {
        position:new Vector3(-1, 1.6, 0),
        scale:new Vector3(-1.2,-0.55,-1),
        rotation:Quaternion.Zero(),
        imageSrc:`images/button-open-chest.png`,
        alphaSrc:undefined,
        hoverText:'Open chest to get rewards'
    });

    const openAll = createImageButton(entity, {
        position:new Vector3(1, 1.6, 0),
        scale:new Vector3(-1.2,-0.55,-1),
        rotation:Quaternion.Zero(),
        imageSrc:`images/button-open-all.png`,
        alphaSrc:undefined,
        hoverText:'Open all chests'
    });
    openAll.onClick(async () => {
        reproduceAvatarSound("ui_play_collectrewardmultiple_01");
        await handleOpen("unlock-all");
    })
    openChest.onClick(async ()=>{
        reproduceAvatarSound("ui_play_collectrewardsingle_01");
        await handleOpen("unlockWithXp");
    });

    async function handleOpen(endpoint){
        if(state.loading) return;
        //reproduceAvatarSound("chest");
        state.loading = true;
        handleLoadingHoverText();
        await sleep(1000);
        const userData = globalStore.userData.getState();
        const response = await fetch(`${getServerHttpURL()}/${endpoint}`, {
            body:JSON.stringify({                
                DisplayName:userData.user.displayName,
                PlayFabId:userData.PlayFabId,
                ContainerItemId:userData.chests[state.currentPage].ItemId
            }),
            headers:{
                "Content-Type":"application/json"
            },
            method:"POST"
        });
        const {FunctionResult} = await response.json();
        const {GrantedItems, VirtualCurrency, xp} = FunctionResult || {};
        showChestContent({GrantedItems, VirtualCurrency});
        openChest.hide();
        openAll.hide();
        state.loading = false;

        function showChestContent ({GrantedItems = [], VirtualCurrency}) {
            state.section = 1;
            handler.getComponent(OnPointerDown).hoverText = "return";
            const currencyRow = VirtualCurrency?.GC && ["GC",VirtualCurrency.GC,""];
            const fashionTicketsRow = VirtualCurrency?.FT && ["FT", VirtualCurrency.FT, ""];
            const diamondsRow  = VirtualCurrency?.DM && ["DM", VirtualCurrency.DM, ""];

            const tableData = [
                ["CHEST CONTENT","",""],
                ...GrantedItems.filter(i=>i.ItemId!=="Null").map(GrantedItem=>(
                    [GrantedItem.DisplayName,GrantedItem.UsesIncrementedBy,""]
                )),
            ];
            if(currencyRow) tableData.push(currencyRow);
            if(fashionTicketsRow) tableData.push(fashionTicketsRow);
            if(diamondsRow) tableData.push(diamondsRow);
            tableData.push(["xp",(xp||"").toString(),""]);

            table.updateData(tableData);
        };
    }

    if(!globalStore.userData.getState().chests?.length){
        openChest.hide();
        openAll.hide();
    }

    const show = () => {};
    const hide = () => {};
    const dispose = () => {
        //TODO remove any listener added to reconnectableLobbyRoom from here, e.g. UPDATE_COMPETITION_GROUP_REWARDS
        reconnectableLobbyRoom = null;
    };


    globalStore.userData.onChange(({newValue, oldValue, prop}) => {
        if(state.section === 0){
            if(!globalStore.userData.getState().chests?.length) {
                openChest.hide();
                openAll.hide();
            }
            state.pages = fromChestsToTableData(globalStore.userData.getState().chests);
            state.chests = globalStore.userData.getState().chests;
            table.updateData(state.pages[Math.min(state.currentPage, state.pages.length)]);
            if(state.chests.length) {
                openChest.show();
                openAll.show();
            }
        }
    }, "chests");

    return {
        show,
        hide,
        dispose
    };

    async function handlerCallback () {
        if(state.loading) return;
        if(state.section === 1) return await switchToSection0();
        if(state.empty) return;

        state.currentPage++;

        if(state.currentPage > state.pages.length-1){
            state.currentPage = 0;
        }

        table.updateData([//TODO duplicated code
            ["","",""]
        ]);

        async function switchToSection0(){
            table.updateData([["loading...","",""]]);
            state.loading = true;
            //Return to table view, refreshUserData
            openChest.hide();
            openAll.hide();
            state.section = 0;
            await refreshUserData();
            await sleep(500);
            state.loading = false;
        }
    }

    function handleLoadingHoverText(){
        store.onChange(({newProp, oldProp, prop})=>{
            if(newProp){
                handler.getComponent(OnPointerDown).hoverText = "loading ...";
            }else{
                handler.getComponent(OnPointerDown).hoverText = (state.section === 0 ? "switch page/group" : "return");
            }
        },"loading");
    }
};

function fromChestsToTableData (chests) {
    if(!chests?.length){
        return [[
            ["REWARDS", "", ""],
            ["You don't have pending rewards","",""]
        ]];
    }

    return chests.map(c=>[
        ["REWARDS", "#"+c.groupId, ""+c.courseId?.replace("competition-","")],
        ["Avatar name", "Time", "Shots"],
        ...(c?.groupPlayers||c?.group||[])
    ]);
}


export {
    createRewardsPanel
};

function getColumnsConfig(){
    return [
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
    ];
}
