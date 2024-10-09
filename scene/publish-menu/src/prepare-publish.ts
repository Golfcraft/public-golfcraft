import {showMessage} from "../../src/components/server-notification";
import {sleep} from "../../../common/utils";
import {USE_REMOTE_SERVER} from "../../../common/constants";
declare const console;

export async function preparePublish(selectedCourse, address, partsData) {
    console.log("preparePublish", selectedCourse, address);
    const baseURL = USE_REMOTE_SERVER?`https://golfcraftgame.com`:`http://localhost:2569`;
    const courseData = await fetch(`${baseURL}/api/get-course/${selectedCourse.ID}`)
        .then(r=>r.json()).then(data => ({...data, definition:JSON.parse(data.definition)}));
    const courseModification = await fetch(`${baseURL}/api/get-course-modification/${selectedCourse.ID}`)
        .then(r=> r.status === 200 ? r.json() : undefined)
        .then((modificationData)=>(modificationData && {...modificationData, definition:JSON.parse(modificationData.definition)}));
    console.log("courseModification", courseModification)
    const courseDate = new Date(courseData.updated || courseData.created);
    const modificationDate = courseModification && new Date(courseModification?.created || 0) || 0;
    const courseOrModification = (courseDate < modificationDate) ? courseModification: courseData;

    console.log("courseOrModification", courseDate < modificationDate);
    if(courseOrModification.status !== 4){
        showMessage({timeout:10000, message:"This course is not validated or was already published"})
        await sleep(5000);
        return;
    }

    //TODO we can check both directly from theGraph
    const availableParts = await fetch(`https://golfcraftgame.com/bridge/get-parts-balance/${address}`).then(r=>r.json()).then(data => data[address]);
    const golfLandQuery = {
        "query":`{\n  golfLands(where:{ owner:"${address}"}) { id, collection, parts {      id,      balance    }  }}`,
        "variables":null};
    const golfLandGraphURL = `https://gateway-arbitrum.network.thegraph.com/api/1597c31c24fbc0bf0f8ee3ea14f2516a/subgraphs/id/Ccskr6qXCAGpb6h43rYNzQsQzmwMPgSTyPB3rwgyTYm5`;
    const golfLandsResult = await fetch(golfLandGraphURL, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(golfLandQuery)}).then(r=>r.json()).then(r=>r.data.golfLands);
    console.log("golfLandsResult", golfLandsResult);
    const foundPristineLands = golfLandsResult.filter(l=>isLandOfCollectionId(l,selectedCourse.collectionId) && l.parts.filter(p=>p.balance > 0).length === 0);

    console.log("foundPristineLands", foundPristineLands);
    const pristineGolfLandBalance = foundPristineLands.length;
    let golfLandTokenId = courseData.tokenId || foundPristineLands[0]?.id;
    console.log("golfLandTokenId", golfLandTokenId)

    const necessaryParts = courseOrModification.definition.parts.reduce((acc, part)=>{
        if(~part.subtype.toLowerCase().indexOf("skybox")) return acc;
        if(part.type === "solid"){
            const partData = partsData.find(p=>p.alias === part.subtype);
            acc[part.subtype] = acc[part.subtype] || {ID:partData?.ID, alias:part.subtype, amount:0};
            acc[part.subtype].amount++;
        } else if(part.type === "image"){
            acc.image = acc.image || {ID:110, alias:part.subtype, amount:0};
            acc.image.amount++;
        }else if(part.type === "text"){
            acc.text = acc.text || {ID:116, alias:part.subtype, amount:0};
            acc.text.amount++;
        }
        return acc;
    },{});
    const golfLand = golfLandsResult.find(g=>g.id == golfLandTokenId);
    const partsInLand = golfLand?.parts.map(part=>({
        ID:Number(part.id.replace(`${golfLandTokenId}-`,'')),
        amount:part.balance
    }));
    Object.values(necessaryParts).forEach(necessaryPart => {
        const foundPart = partsInLand?.find(p=>p.ID === necessaryPart.ID);

        if(foundPart){
            necessaryPart.amount = (necessaryPart.amount || 0) - foundPart.amount;
        }
        if(necessaryPart.amount <= 0){
            delete necessaryParts[necessaryPart.alias]
        }
    });

    return {//TODO add parts in land, in case the land has a part that is not present in the map definition, to tell the user to add it
        ID: courseData.ID,
        alias: courseData.alias,
        availableParts,
        necessaryParts,
        golfLandTokenId,
        pristineGolfLandBalance,
        collectionId: courseData.collectionId,
        address
    };

    function isLandOfCollectionId(data, collectionId:number){
        return getCollectionFromId(Number(data.id)) == collectionId;
    }

    function getCollectionFromId(id:number):number{//TODO fix theGraph indexation
        if (id > 112) return 5;
        if (id > 99) return 4;
        if (id > 76) return 3;
        if (id > 56) return 2;
        if (id > 44) return 1;

        return 0;
    }
}