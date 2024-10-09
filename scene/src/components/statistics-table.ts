import {globalStore} from "../services/globalStore/globalStore";
import {createTextShapeTable} from "../../TextShapeTable";
const createStatisticsTable = (parent, {position, rotation, stateNames, title}) => {
    const entity = new Entity();
    entity.addComponent(new Transform({position, rotation}));
    entity.setParent(parent);
    const titleEntity = new Entity();
    titleEntity.setParent(entity);
    const titleText = new TextShape(title);
    titleText.font = new Font(Fonts.SanFrancisco_Heavy);
    titleText.fontSize = 3;    
    titleText.hTextAlign = "left";
    titleText.vTextAlign = "top";
    titleText.color = new Color3(1,1,0.6);
    titleEntity.addComponent(titleText);
    titleEntity.addComponent(new Transform({
        position:new Vector3(-1.8,0,0)
    }))
    const table = createTextShapeTable(entity, entity, {
        entity:{
            position: new Vector3(-1.7,-0.5, 0),
            rotation:Quaternion.Euler(0,0,0),
        },
        text:{
            font: Fonts.SanFrancisco,
            fontSize:3,
            color: new Color3(1,1,0.5)
        },
        data:getTableData(),
        columns: [
            {
                width:3.1,
                text:{
                    fontSize:3,
                    font: Fonts.SanFrancisco,
                    hTextAlign:'left',
                }
            },{
                width:0.2,
                text:{
                    fontSize:3,
                    font: Fonts.SanFrancisco,
                    hTextAlign:'right',
                }
            }
        ]
    });

    globalStore.userData.onChange(updateData);

    function getTableData(){
        const state = globalStore.userData?.getState();
        const resolvedObj = Object.keys(stateNames).reduce((acc, key)=>{
            if(!stateNames[key].fnValue){
                acc[key] = Number(state[key] || 0);
            }
            return acc;
        },{});

        const data = Object.keys(stateNames).filter(k=>!stateNames[k].hide).map((rowKey)=>{
            return [
                stateNames[rowKey].label,
                resolveValue(rowKey)
            ]
        });

        function resolveValue(key){
            if(stateNames[key].fnValue){
                return stateNames[key].fnValue(resolvedObj);
            }else{
                return resolvedObj[key]
            }
        }

        return data;
    }
    function updateData(newValue, oldValue, prop){
        table.updateData(getTableData());
        
    }
}

export {
    createStatisticsTable
}