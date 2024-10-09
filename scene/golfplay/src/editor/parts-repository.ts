import {USE_REMOTE_SERVER} from "../../../../common/constants";

const partsURL = USE_REMOTE_SERVER?`https://golfcraftgame.com/api/parts`:`http://localhost:2569/api/parts`;
const cache = {
    data:null,
    wip:null
};

const loadParts = async (wip?:boolean, includeDeclined?:boolean) => {
    if(!wip && cache.data) return cache.data;
    if(wip && cache.wip) return cache.wip;
    let where = wip?{}:{OR:[{status:2}]};
    if(includeDeclined && !wip){
        where.OR.push({status:3});
    }

    const parts = await fetch(`${partsURL}${wip?`-wip`:``}`, {
        method:"POST",
        body:JSON.stringify({
            where
        }),
        headers:{"Content-Type":"application/json"}
    }).then( r => r.json()).then(c=>c.map(p=>({
        ...p,
        definition:JSON.parse(p.definition),
        boundingBox:JSON.parse(p.boundingBox)
    }))).then(parts => parts.filter(p=>p.alias !== null));
    if(!wip) cache.data = parts;
    if(wip) cache.wip = parts;

    return parts;
}
const getPartsData = () => cache.data || cache.wip;
export {loadParts, getPartsData};