import {getDifferentRandomInts, getRandomFromList, getRandomInt, removeValueFromArray} from "../../common/utils";
import namesRepo from "./random-names.json";
import {PlayFabServer} from "playfab-sdk";
import {promisify} from "util";
const NUMBER_OF_GHOSTS = 3, NUMBER_OF_COURSES = 4;

export const seasonsApi = (router, prisma) => {
    console.log("seasonsAPI");
    router.post(`/api/recorded-game`, async (req, res) => {
        try{
            const {PlayFabId,courseAlias,displayName} = req.body;
            //TODO if the player already has 10 recorded games in this map, don't record
            const count = await prisma.recorded_game.count({where:{
                    PlayFabId,
                    courseAlias,
            }});
            if(count >= 10){
                const bestRecordedGame = await prisma.recorded_game.findFirst({
                    where:{
                        PlayFabId,
                        courseAlias,
                    },
                    orderBy:[
                        {shots:"asc"},
                        {time:"asc"}
                    ]
                });
                console.log(`player ${PlayFabId} (${displayName}) has more than 10 recorded games on map ${courseAlias}. Deleting last best game: ${ JSON.stringify({...bestRecordedGame, frames:undefined})  }`);
                await prisma.recorded_game.delete({where:{ID:bestRecordedGame.ID}});
            }
            const result = await prisma.recorded_game.create({data: req.body});

            res.send(result);
        }catch(error){
            console.log("error", error, req.body);
            res.status(500).send({error});
        }
    });

    router.post(`/api/get-random-recorded-games`, async (req, res) => {
        try{
            const {address, courseAliases, minPercentile = 0, maxPercentile = 100, maxAttempts} = req.body;
            console.log("GRRG get-random-recorded-games", address, minPercentile, maxPercentile, courseAliases);
            const pickedRecords = [[], [], [], []];
            const queryStartTime = Date.now();
            let attempts = 0;
            const courseIDs = [];
            for(let alias of courseAliases){
                courseIDs.push((await prisma.courses.findFirst({where:{alias}})).ID)
            }
            while(!isFilled(pickedRecords) && attempts < (maxAttempts || 10) && ((Date.now() - queryStartTime) < 15000) ) {
                console.log("GRRG attempts", attempts);
                const extremeOfCourse0 = await getPercentileExtremes({
                    courseID:courseIDs[0],
                    minPercentile:Math.max(0, minPercentile - attempts * 10),
                    maxPercentile:Math.min(100, maxPercentile + attempts * 10)
                });

                const query = {
                    where: {
                        courseID: courseIDs[0],
                        shots: (extremeOfCourse0?.start && extremeOfCourse0?.end) && {
                            lte: extremeOfCourse0?.start?.shots,
                            gte: extremeOfCourse0?.end?.shots
                        } || undefined,
                        time:extremeOfCourse0?.start?.time && {
                            gte: Math.min(Number(extremeOfCourse0.start.time), Number(extremeOfCourse0.end.time)),
                            lte: Math.max(Number(extremeOfCourse0.start.time), Number(extremeOfCourse0.end.time))
                        } || undefined,
                        ...({
                            AND:[{address}, ...pickedRecords[0]].map(r=>r?.address && ({
                                NOT:{address:r?.address}
                            }))
                        })
                    }
                };
                console.log("GRRG query",JSON.stringify(query));
                const firstCourseRecord = await pickRandomRow(query);
                if(firstCourseRecord){
                    const pickedRecordsFromPlayer = [firstCourseRecord];
                    const nonFirstCourseIDs = courseIDs.slice(1,4);
//TODO EN VEZ DE BUSCAR POR courseAlias, buscar por courseID

                    for(let courseID of nonFirstCourseIDs){//TODO, to optimize, better to start from last, because sometimes people doesnt finish
                        const extremeOfCourse = await getPercentileExtremes({
                            courseID,
                            minPercentile:Math.max(0,minPercentile - attempts * 5),
                            maxPercentile:Math.min(100,maxPercentile + attempts * 5)
                        });
                        const nonFirstCourse = await pickRandomRow({
                            where:{
                                address:firstCourseRecord?.address,
                                courseID,
                                shots:(extremeOfCourse?.start && extremeOfCourse?.end) && {
                                    lte: extremeOfCourse.start.shots,
                                    gte: extremeOfCourse.end.shots
                                } || undefined,
                                time:extremeOfCourse?.start?.time && {
                                    gte: Math.min(Number(extremeOfCourse.start.time), Number(extremeOfCourse.end.time)),
                                    lte: Math.max(Number(extremeOfCourse.start.time), Number(extremeOfCourse.end.time))
                                } || undefined,
                            }
                        });
                        if(!nonFirstCourse) {
                            console.log(`!! Lack any record of address ${firstCourseRecord.address} on course ${courseAliases[courseIDs.indexOf(courseID)]}`);
                            continue;
                        }else{
                            pickedRecordsFromPlayer.push(nonFirstCourse);
                            if(courseIDs.indexOf(courseID) === 3){
                                if(pickedRecordsFromPlayer.length === 4){
                                    pickedRecords[0].push(pickedRecordsFromPlayer[0]);
                                    pickedRecords[1].push(pickedRecordsFromPlayer[1]);
                                    pickedRecords[2].push(pickedRecordsFromPlayer[2]);
                                    pickedRecords[3].push(pickedRecordsFromPlayer[3]);
                                }
                            }
                        }
                    }
                }else{
                    console.log("GRRG Non row")
                }

                attempts++;
            }
            let percentileMargin = 0;
            while(!isFilled(pickedRecords) && percentileMargin < 50 && ((Date.now() - queryStartTime) < 30000)){
                //TODO no need to reset all
                console.log("GRRG percentileMargin",percentileMargin);
                const numPlayers = pickedRecords[3].length;
                const fakeNames = [getRandomFromList(namesRepo),getRandomFromList(namesRepo),getRandomFromList(namesRepo),getRandomFromList(namesRepo)]
                    .map(n=>`${n}#${fakeId()}`);
                let c = NUMBER_OF_COURSES;
                let minShots = 999;
                while(c--){
                    let i = NUMBER_OF_GHOSTS - numPlayers;
                    const courseID = courseIDs[c];
                    const extremes = await getPercentileExtremes({
                        courseID,
                        minPercentile:Math.max(0, minPercentile-percentileMargin),
                        maxPercentile:Math.min(100, maxPercentile+percentileMargin)
                    });
                    minShots = Math.min(extremes.start?.shots,extremes.start?.shots);

                    console.log("extremes", courseAliases[courseIDs.indexOf(courseID)], extremes.start?.shots, extremes.end?.shots)
                    while (i-- && extremes.start?.time && extremes.end?.time) {
                        const query = {
                            where: {
                                courseID,
                                shots:(extremes.end && extremes.start) && {
                                    gte: extremes.end.shots,
                                    lte: extremes.start.shots
                                } || undefined,
                                time: (extremes.end && extremes.start) &&{
                                    gte: Math.min(Number(extremes.start.time), Number(extremes.end.time)),
                                    lte: Math.max(Number(extremes.start.time), Number(extremes.end.time))
                                } || undefined,
                            }
                        };
                        console.log("GRRG query", query)
                        const randomRow = await pickRandomRow(query);
                        if(randomRow){
                            if(pickedRecords[c].length < NUMBER_OF_GHOSTS){
                                //TODO review why is necessary to add a new ghost with same gameplay?
                                pickedRecords[c].push({
                                    ...randomRow,
                                    displayName: fakeNames[i],
                                    address:"fake",
                                    isFake:true
                                });
                            }
                        }else{
                            pickedRecords[c].splice(0, pickedRecords.length);
                        }

                    }
                }
                percentileMargin += 5;
            }
            console.log("GRRG done", pickedRecords.length)

            setSameNamesOnAllRecords(pickedRecords);
            removeGhostsWithoutAllMaps(pickedRecords);
            removeDuplicatedGhosts(pickedRecords);
            console.log("sending picked records", !!pickedRecords);
            return res.send(pickedRecords)

            function removeDuplicatedGhosts(pickedRecords){
                let hasDuplicatedGhosts = false;
                pickedRecords.forEach((courseRecords, gameIndex) => {
                    if(
                        courseRecords[gameIndex] && findDuplicates([
                            courseRecords[gameIndex][0] && courseRecords[gameIndex][0].ID,
                            courseRecords[gameIndex][1] && courseRecords[gameIndex][1].ID,
                            courseRecords[gameIndex][2] && courseRecords[gameIndex][2].ID
                        ]).filter(i=>i).length
                    ){
                        hasDuplicatedGhosts = true
                    }
                });

                if(hasDuplicatedGhosts){
                    pickedRecords[0][1] = null;
                    pickedRecords[0][2] = null;
                    pickedRecords[1][1] = null;
                    pickedRecords[1][2] = null;
                    pickedRecords[2][1] = null;
                    pickedRecords[2][2] = null;
                    pickedRecords[3][1] = null;
                    pickedRecords[3][2] = null;
                    pickedRecords.forEach((p, i) => pickedRecords[i] = p.filter(i => i));
                }

                function findDuplicates(arr) {
                    return arr.filter((currentValue, currentIndex) =>
                        arr.indexOf(currentValue) !== currentIndex);
                }
            }

            function removeGhostsWithoutAllMaps(pickedRecords){
                const indexesWithoutMaps = new Set();
                pickedRecords.forEach(courseRecords => {
                    courseRecords.forEach((courseRecords, ghostIndex) => {
                        if(!pickedRecords[1][ghostIndex] || !pickedRecords[0][ghostIndex] || !pickedRecords[2][ghostIndex] || !pickedRecords[3][ghostIndex]){
                            indexesWithoutMaps.add(ghostIndex)
                        }
                    });
                })

                indexesWithoutMaps.forEach((ghostIndexToRemove:number) => {
                    pickedRecords[0][ghostIndexToRemove] = null;
                    pickedRecords[1][ghostIndexToRemove] = null;
                    pickedRecords[2][ghostIndexToRemove] = null;
                    pickedRecords[3][ghostIndexToRemove] = null;
                });
                pickedRecords.forEach((p, i) => pickedRecords[i] = p.filter(i => i));
            }

            function isFilled(records){
                return records.every(a=>a.length >= 3);
            }

            function setSameNamesOnAllRecords(records){
                try{
                    records.forEach((r,i) => {
                        if(i){
                            if(records[i][0]) records[i][0].displayName = records[i-1][0]?.displayName || "/player/";
                            if(records[i][1]) records[i][1].displayName = records[i-1][1]?.displayName || "/player/";
                            if(records[i][2]) records[i][2].displayName = records[i-1][2]?.displayName || "/player/";
                        }
                    })
                }catch(error){
                    console.error("Error on setSameNamesOnAllRecords", error);
                }
            }
        }catch(err){
            console.error("GRRG err",err?.message,"\n" ,JSON.stringify( req.body),"\n");
            return res.send([[], [], [], []])
        }
    });

    router.post(`/api/get-records-of-course-percentiles`, async (req,res)=>{
        const {courseAlias, minPercentile, maxPercentile, address} = req.body;

        return res.send(await getRecordsOfCoursePercentiles({courseAlias, minPercentile, maxPercentile, address}))
    });

    router.post(`/api/get-percentile-extremes`, async (req, res)=>{
        return res.send(await getPercentileExtremes(req.body))
    });

    router.post(`/api/get-percentile-extremes2`, async (req, res)=>{
        const records = await getRecordsOfCoursePercentiles(req.body);

        return res.send({start:records[0], end:records[records?.length-1]})
    });

    router.get(`/api/get-player-tier-sub/:address`, async (req,res) => {
        try{
            const {address} = req.params;

            return res.send(await promisify(PlayFabServer.GetPlayFabIDsFromGenericIDs)({
                GenericIDs:[{ServiceName:"address",UserId:address}]
            }).then(r=>r?.data?.Data));
        }catch(error){
            res.status(500).send({error});
        }
    });

    router.post(`/api/get-random-row`, async (req, res)=>{
        try{
            const {query, table} = req.body;
            const result = await pickRandomRow(query, table)
            return res.send(result||null);
        }catch(error){
            return res.status(500).send(error);
        }

    })

    async function pickRandomRow(query, table = "recorded_game"){
        console.time("count");
        const count = await prisma[table].count(query);
        console.timeEnd("count");
        if(!count) return null;
        const randomIndex = getRandomInt(0,count-1);

        console.time("query");
        const result = await prisma[table].findMany({
            skip: randomIndex,
            take: 1,
            ...query
        });
        console.timeEnd("query")

        return {
            ...result[0],
            ID:Number(result[0].ID)
        };
    }

    /**
     * Returns {minShots, minTime, maxShots, maxTime}
     */
    async function getPercentileExtremes({
                                             courseID,
                                             address = undefined,
                                             minPercentile = 0,
                                             maxPercentile = 100,
                                             where = {},
                                         }){
        const baseQuery = {
            where:{ ...where, courseID, address },
            orderBy:[{shots:"desc"},{time:"desc"}],
            select:{ID:true, shots:true, time:true, address:true}
        };
        const count = await getCountOfCourseID(courseID, baseQuery);//TODO add address
        const skip = Math.floor(minPercentile * count / 100);
if(isNaN(skip)){
    console.log("skip is NaN");
}
        const startRes = (await prisma.recorded_game.findMany({...baseQuery,
            skip: Math.max(0, skip),
            take: 1
        } as any));
        const endRes = (await prisma.recorded_game.findMany({...baseQuery,
            skip: Math.max(0, Math.ceil(maxPercentile * count / 100) - 1),
            take: 1
        } as any));//TODO why no result?

        if(!startRes[0] || !endRes[0]){
            console.log("bug?")
        }

        return {start:startRes[0],end:endRes[0]};//TODO rename start,end to worst,best
    }


    async function getCountOfCourseAlias(courseID, baseQuery = {where:undefined}){
        return prisma.recorded_game.count({...baseQuery, where:{...baseQuery.where, courseID}, select:undefined}); //TODO we should add map name
    }
    
    async function getCountOfCourseID(courseID, baseQuery = {where:undefined}){
        return prisma.recorded_game.count({...baseQuery, where:{...baseQuery.where, courseID}, select:undefined}); //TODO we should add map name
    }

    async function getRecordsOfCoursePercentiles({courseAlias, address, minPercentile = 0, maxPercentile = 100,
                                                     where = {where:undefined},
                                                     select = { displayName: true, shots:true, time:true, ID:true, address:true, PlayFabId:true, courseAlias:true, courseID:true, courseName:true, courseVersion:true, frames:true} //TODO REVIEW: if optimization necessary, avoid frames, but include when necessary
    }:any) {
        const count = await getCountOfCourseAlias(courseAlias);
        const skip = Math.floor(minPercentile * count / 100);
        const records = await prisma.recorded_game.findMany({
            skip,
            take: Math.ceil(maxPercentile * count / 100) - skip,
            where:{ ...where, courseAlias },
            orderBy:[{shots:"desc"},{time:"desc"}],
            select
        });

        return records;

    }
}

function fakeId(){
    // always start with a letter (for DOM friendlyness)
    var idstr=String.fromCharCode(Math.floor((Math.random()*25)+65));
    do {
        // between numbers and characters (48 is 0 and 90 is Z (42-48 = 90)
        var ascicode=Math.floor((Math.random()*42)+48);
        if (ascicode<58 || ascicode>64){
            // exclude all chars between : (58) and @ (64)
            idstr+=String.fromCharCode(ascicode);
        }
    } while (idstr.length<4);

    return (idstr).toLowerCase();
}