import {createStatisticsTable} from "./statistics-table";
import {getGLTFShape} from "../../golfplay/services/resource-repo";

export type TrainingStatisticPanelOptions = {
    position:Vector3,
    title?:string,
    stateNames?:any
    rotation?:Quaternion
}

const createStatisticsPanel = (parent, {position, rotation = Quaternion.Zero(), title, stateNames}:TrainingStatisticPanelOptions)=>{
    const entity = new Entity();
    entity.setParent(parent);
    entity.addComponent(new Transform({
        position,
        rotation
    }));
    const board = new Entity();
    board.addComponent(new Transform({
        
    }));
    board.setParent(entity);
    const boardShape = getGLTFShape(`models/board.glb`);
    board.addComponent(boardShape)

    createStatisticsTable(entity, {
        title:title || 'Training statistics',
        position:new Vector3(0, 3.6, 0),
        rotation:Quaternion.Euler(0,0,0),
        stateNames:stateNames || {
            total:{
                label:'Total',
                fnValue:({training_success, training_failed})=>training_failed+training_success
            },
            training_success: { label: 'Success' },
            training_failed: { label: 'Failed' },
            training_playedTime: { hide: true },
            trainingPlayedHours: {
                label:'Played hours',
                fnValue:({training_playedTime}) => Math.floor(training_playedTime / 1000 / 60 / 60)
            },
        }
    });
}

export {
    createStatisticsPanel
};