import dotenv from'dotenv';
dotenv.config();
import { callDiscordHook } from "../../../../common/discord";
import AdminJS, {NotFoundError, paramConverter, populator, ValidationError} from 'adminjs';
import { Database, Resource } from '@adminjs/prisma';

import {PrismaClientValidationError} from '@prisma/client/runtime'
import basicAuth = require('express-basic-auth')
import {initAdmin} from "./admin";
import {runChecks} from "../../../../chain-playfab/security/securityChecks";
import {getFinalMaterials, getFinalMaterials2} from "../../../../common/resource-bonus";
import {PlayFabServer} from "playfab-sdk";
import {promisify} from "util";
import {processHookRequest} from "./playfab-hook-processor";
import fetch from "cross-fetch";
import {getRandomInt, shuffle} from "../../../../common/utils";
const VALID_PARCELS: number[][] = [
    [47,-45],[48,-45],[49,-45],
    [47,-44],[48,-44],[49,-44],
    [47,-43],[48,-43],[49,-43]
];
AdminJS.registerAdapter({ Database, Resource });
const API_URL = (process.env.PROD || process.env.prod) ? `https://golfcraftgame.com` : `http://localhost:2569`;
if(!process.env.GOLF_API_KEY){
    throw Error("missing GOLF_API_KEY");
}
export const coursesApi = (router, app, prisma)=>{
    console.log("coursesAPI");
    const {admin, adminRouter} = initAdmin(prisma);
    console.log("x")
    //const adminRouter = AdminJSExpress.buildRouter(admin)
    const authMiddleware = basicAuth({
        users:{
            'admin':process.env.ADMIN_PASS,
        },
        challenge:true
    })

    app.use(admin.options.rootPath, adminRouter);

    router.get(`/api/get-course/:ID`, async (req, res)=>{
        const {ID} = req.params;
        return await tryPrisma(req,res)(prisma.courses.findUnique, {
            where:{ID:Number(ID)}
        });
    });
    router.get(`/api/get-course-modification/:ID`, async (req, res)=>{
        const {ID} = req.params;
        return await tryPrisma(req,res)(prisma.course_modification.findFirst, {
            where:{course_ID:Number(ID)}
        });
    });

    router.post(`/api/get-course`, async (req, res)=>{
        const {ID, alias} = req.body;

        if (await isCourseInSeason(ID, alias)) {
            return getCourseWip(req, res);
        } else {
            return await tryPrisma(req,res)(prisma.courses.findFirst, {
                where:ID
                    ? { ID }
                    : { alias }
            });
        }
    });

    router.post(`/api/get-random-courses`, async (req, res)=>{
        try{
            const {useOwnMaps, address, numberOfMaps = 12, collectionId, maxDifficulty, where} = req.body;
            console.log("get-random-courses", {useOwnMaps, address, numberOfMaps, collectionId, maxDifficulty, where});
            let selectedMaps = await selectRandomMaps({useOwnMaps, address, numberOfMaps, collectionId, maxDifficulty, where});
            if(selectedMaps.length !== numberOfMaps){
                selectedMaps = await selectRandomMaps({useOwnMaps, address:undefined, numberOfMaps, collectionId:undefined, maxDifficulty:9, where:undefined});
            }
            return res.send(selectedMaps)
            async function selectRandomMaps({useOwnMaps, address, numberOfMaps = 12, collectionId, maxDifficulty, where}){
                const select = {
                    ID:true,
                    minTierCat:true,
                    alias:true,
                    displayName:true,
                    isSeason:true,
                    status:true,
                    createdBy:true,
                    authorName:true,
                    collectionId:true,
                    tokenId:true
                };
                const ownMaps = useOwnMaps
                    ? shuffle(await prisma.courses.findMany({
                        select,
                        where: {
                            OR: [
                                {
                                    createdBy: address.toLowerCase(),
                                    status: 2, //TODO 2 or 4
                                },
                                {
                                    createdBy: address.toLowerCase(),
                                    status: 4
                                }
                            ]
                        }
                    })).splice(0, numberOfMaps).map(m => ({...m, ID:Number(m.ID)}))
                    : [];
                const otherMaps = [];
                console.log("ownMaps",ownMaps);
                while((ownMaps.length+otherMaps.length) < numberOfMaps){
                    const whereQuery = {
                        OR: [
                            {
                                status: 4,
                                collectionId
                            },{
                                collectionId,
                                isSeason:1
                            }
                        ],
                        minTierCat:{ lte:maxDifficulty },
                        ...where
                    };
                    if(where.OR === null) whereQuery.OR = undefined;
                    console.log("whereQuery", whereQuery);
                    //TODO select a random map
                    otherMaps.push(await pickRandomRow({
                        select,
                        where: whereQuery
                    }, "courses"))
                }
                console.log("otherMaps",otherMaps);
                return [...ownMaps, ...otherMaps].filter(i=>i)
            }

            console.log(req.body)


            async function pickRandomRow({where, select} = {where:{}, select:{}}, table = "courses"){
                const count = await prisma[table].count({where});
                if(!count) return null;
                const randomIndex = getRandomInt(0,count-1);
                const result = await prisma[table].findMany({
                    skip: randomIndex,
                    take: 1,
                    where,
                    select
                });

                return {
                    ...result[0],
                    ID:Number(result[0].ID)
                };
            }
        }catch(error){
            console.error(error);
            res.status(500).send({error});
        }

    });
    async function isCourseInSeason(ID, alias) {
        console.log("isCourseInSeason",ID,alias)
        const course = await prisma.courses.findUnique({
            where:ID
                ? { ID }
                : { alias }
        });
        if(!course){
            return false;
        }
        if (course.isSeason == 1) return true;
        return false;
    }

    router.get(`/api/material-drops`, async (req, res)=>{
        return await tryPrisma(req, res)(prisma.material_drops.findMany, {});
    });

    router.get(`/api/get-random-confession`, async (req, res)=>{
        const productsCount = await prisma.confessions.count({where:{banned:null}});
        const skip = Math.floor(Math.random() * productsCount);

        const randomPick = await prisma.confessions.findMany({
            where:{banned:null},
            take: 1,
            skip
        });
        return res.send(randomPick[0]?.text || "");
    });

    router.get(`/api/get-random-confessions`, async (req, res)=>{
        const confessions = [];
        while(confessions.length < 10){

            const productsCount = await prisma.confessions.count({where:{banned:null}});
            const skip = Math.floor(Math.random() * productsCount);

            const randomPick = await prisma.confessions.findMany({
                where:{banned:null},
                take: 1,
                skip
            });
            confessions.push(randomPick[0]?.text || "")
        }

        return res.send(confessions);
    });

    router.post(`/api/get-login-id`, async (req, res) => {
        try{
            if (process.env.PROD && !(await runChecks(req))) {
                return res
                    .status(400)
                    .json({ valid: false, error: "Validation error, try from another Realm" })
            }

            const authchain0 = await JSON.parse(req.header(`x-identity-auth-chain-0`));
            const address= authchain0.payload.toLowerCase();
            const [{PlayFabId}] = await promisify(PlayFabServer.GetPlayFabIDsFromGenericIDs)({
                "GenericIDs": [
                    {
                        "ServiceName": "address",
                        "UserId": address
                    }]
            }).then(r=>r.data.Data);

            if(PlayFabId){
                const {CustomIdInfo} = await promisify(PlayFabServer.GetUserAccountInfo)({PlayFabId}).then(r=>r.data.UserInfo);
                const {CustomId} = CustomIdInfo;

                return res.send({CustomId});
            }else{
                const CustomId = generateString(100);
                return res.send({CustomId});
            }
        }catch(error){
            console.log("/api/get-login-id error", error)
            return res.status(500).send({error})
        }
    })

    router.post(`/api/submit-confession`, async (req, res)=>{
        try{
            const {text} = req.body;
            if(text.length < 5) return res.status(500).send({error:"TOO_SHORT"});
            if(text === "Write text here") return res.status(500).send({error:"WRONG_CONTENT"});
            if(text.length > 280) return res.status(500).send({error:"TOO_LONG"});
            await prisma.confessions.create({
                data: {text}
            });
            callDiscordHook(text,"https://discord.com/api/webhooks/989979097839075368/cFhEGLJV3pNWn8xFt-ftlDXGmEJ3_GUVsoxlq4zmSko4SthONXWpiSLS47IWGb_ETpEV")
            return res.send({result:true})
        }catch(error){
            return res.status(500).send({error:"Error"});
        }
    });

    router.post(`/api/update-course-valuation`, async (req, res)=>{
        try{
            const {ID, alias, timesPlayed, timesAbandoned, averageTime, averageArea, averageShoots, averageDistance, partTypes} = req.body;
            const bonus = getFinalMaterials(timesAbandoned||0, timesPlayed||0, averageTime||0);
            const bonus2 = getFinalMaterials2(timesAbandoned||0, timesPlayed||0, averageTime||0, averageArea||0, averageShoots||0, averageDistance||0, partTypes||[]);
            console.log("update-course-valuation", {alias, timesPlayed, timesAbandoned, averageTime, averageArea, averageShoots, averageDistance, partTypes, bonus, bonus2});
            callDiscordHook(`update-course-valuation ${alias} ${JSON.stringify({alias, timesPlayed, timesAbandoned, averageTime, averageArea, averageShoots, averageDistance, partTypes, bonus, bonus2})}`)
            if(!isNaN(bonus2)){
                const updateResult = await prisma.courses.update({
                    where:{alias},
                    data:{
                        timesAbandoned,
                        timesPlayed,
                        averageTime:averageTime && Math.floor(averageTime) || undefined,
                        averageShoots:averageShoots || undefined,
                        averageArea:averageArea || undefined,
                        averageDistance:averageDistance || undefined,
                        evaluation:Math.min(Math.floor(bonus2*100), (timesPlayed||1) * 2)
                    }
                });
                console.log("updateResult",updateResult);
            }else{
                callDiscordHook("NaN evaluation, not updated.");
            }

            return res.send({result:true});
        }catch(error){
            console.log("error updating evaluation", req.body,error);
            return res.status(404).send();
        }
    })

    router.post(`/api/vote-map`, async (req, res)=>{
        //TODO apply some security, signedFetch at least
        try{
            const {address, PlayFabId, vote, course_alias } = req.body;
            const isReviewer = await prisma.vote_reviewer.findFirst({
                where:{
                    address,
                    PlayFabId
                }
            });
            await prisma.votes.create({
                data:{
                    PlayFabId,
                    address,
                    course_alias,
                    reviewer:isReviewer?1:0,
                    vote
                }
            })
            return res.send({result:true});
        }catch(error){
            console.log("api/vote-map error", error);
            return res.status(500).send({error:true});
        }
    });

    router.post(`/api/get-course-wip`, async (req, res)=>{
        return getCourseWip(req, res);
    });

    async function getCourseWip(req, res) {
        const {ID, alias} = req.body;

        const course = await prisma.courses.findUnique({
            where:ID
                ? { ID }
                : { alias }
        });
        if(!course){
            console.log("Course not found", ID, alias)
            return res.status(404).send({error:{message:"NOT FOUND"}});
        }
        const course_ID = course.ID;
        const lastCourseDate = course.updated || course.created;
        const lastModification = await prisma.course_modification.findFirst({
            where:{
                course_ID,
                created:{
                    gt:lastCourseDate || new Date(0)
                }
            },
            orderBy:{
                created:'desc'
            }
        });
        const joinedCourse:any = {...course};
        if(lastModification){
            joinedCourse.definition = lastModification.definition;
            joinedCourse.metadata = lastModification.metadata || course.metadata;
            joinedCourse.isModification = true;
        }

        return res.send(joinedCourse);
    };

    router.post(`/api/courses`, async (req, res)=>{
        const {where, modifications, orderBy} = req.body;

        const courses = await prisma.courses.findMany({
            where,
            select:{
                ID:true,
                alias:true,
                metadata:true,
                status:true,
                mode:true,
                subType:true,
                evaluation:true,
                created:true,
                updated:true,
                displayName:true,
                collectionId:true
            },
            orderBy
        });
        if(!modifications){
            return res.send(courses);
        }else{
            const courseIDs = courses.map(c=>c.ID);
            console.log("courseIDs", courseIDs);
            const courseModifications = await prisma.course_modification.findMany({
                where:{
                    OR:courseIDs.map(ID=>({course_ID:ID}))
                }
            });
            return res.send(courses.map(course => {
                const foundModification = courseModifications.find(m=>m.course_ID === course.ID);
                if(foundModification?.created && (foundModification.created > (course.updated || course.created || "0"))){
                    course.status = foundModification.status;
                }
                return course;
            }))
        }
    });

    const TRAINING_ALIAS_REGEXP = /training-\d-.*/;
    router.post(`/api/course`, authMiddleware, async (req, res)=>{
        let mode = "competition", subType = "1";
        if(TRAINING_ALIAS_REGEXP.test(req.body.alias)){
            [mode,subType] = req.body.alias.split("-");
        }
        const createdBy = req.body.createdBy.toLowerCase() || "admin";
        return await tryPrisma(req, res)(prisma.courses.create, {
            data:{...req.body, created:new Date().toISOString(), mode, subType, createdBy}
        }).then(r=>{
            console.log("CREATE courses", JSON.stringify(req.body));
            return r;
        });

    });
    const MAX_PARTS = 500;
    const INVALID_ALIAS_REGEXP = /,/g;

    router.post(`/api/player-game`, async (req,res)=>{
        try{
            const {apiKey, address, PlayFabId, course_alias, startTime, endTime, gameMode, data, course_ID, subType, time} = req.body;
            console.log("player-game received", {address, PlayFabId, course_alias, startTime, endTime, gameMode, data, course_ID, subType, time});
            if(apiKey !== process.env.GOLF_API_KEY){
                console.log("Wrong auth");
                return res.status(400).send({error:{message:"NON AUTH"}});
            }
            const r = await fetch(`${API_URL}/api/event`, {
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify(getEventDefinition({PlayFabId,subType,gameMode}))
            }).then(r=>r.json());
            await prisma.player_game.create({
                data:{address, PlayFabId, course_alias, startTime:new Date(startTime), endTime:new Date(endTime), gameMode, data, course_ID, subType, time}
            });

            return res.send({result:true});

            function getEventDefinition({gameMode, subType, PlayFabId}){
                const event:any = {type:null, data:{}};
                event.data.PlayFabId = PlayFabId;
                event.data.subType = subType;
                if(gameMode === "training") {
                    event.type = "training-success";
                }else if(gameMode === "competition"){
                    event.type = "competition-played";
                }else if(gameMode === "tournament"){
                    event.type = "tournament-played";
                }else{
                    event.type = `${gameMode}-played`;
                }

                return event;
            }
        }catch(error){
            console.log("player-game error", error)
            return res.status(500).send({error});
        }
    });

    router.post(`/api/editor-course`, async (req, res)=> {
        const {address, definition, metadata, alias, authorName, collectionId} = req.body;
        if(INVALID_ALIAS_REGEXP.test(alias)){
            return res.status(599).json({
                error: "Invalid course name"
            })
        }else if(alias.length > 45){
            return res.status(599).json({
                error: "Course name is too long"
            })
        }

        if(definition.parts.length > MAX_PARTS){
            return res
                .status(400)
                .json({error: "Golf course too big, remove some parts" })
        }
        if (process.env.PROD && !(await runChecks(req, VALID_PARCELS))) {
            return res
                .status(400)
                .json({ valid: false, error: "Validation error, try from another Realm" })
        }

        let result;
        try{

            const authchain0 = await JSON.parse(req.header(`x-identity-auth-chain-0`));
            if(address !== "admin-editor" && authchain0.payload.toLowerCase() !== address.toLowerCase()){
                return res.status(500).json({error:"Error x"});
            }
            result = await prisma.courses.create({
                data:{
                    alias,
                    definition:JSON.stringify(definition),
                    metadata:JSON.stringify({duration:metadata.duration, xp:0, GC:0, minLevel:1}),
                    status:0,
                    created:new Date().toISOString(),
                    createdBy:address.toLowerCase(), //TODO replace with address, validated with signature (ephemeral)
                    authorName,
                    collectionId:collectionId||0
                }
            });
        }catch(err){
            return res.status(400).send({error:err});
        }

        return res.send(result);
    });

    router.put(`/api/editor-course`, async (req, res) => {
        try{
            const {ID, definition, metadata, alias, displayName, address} = req.body;
            const aliasOrName = alias || displayName;
            console.log("/api/editor-course",{ID, definition, metadata, alias, displayName, address})
            const foundCourseModification = await prisma.course_modification.findFirst({where:{course_ID:ID}});
            const foundCourse = await prisma.courses.findUnique({where:{ID}});
//TODO if the course has isSeason:true, return error
            if(foundCourse.isSeason){
                return res.status(500).send({
                    error:"Season map is being used"
                })
            }
            if(ID <= 281){
                if(!(foundCourseModification?.status === 0 || foundCourseModification?.status === 4)){
                    return res.status(500).json({
                        error: "old maps are frozen"
                    })
                }
            }
            if(aliasOrName && INVALID_ALIAS_REGEXP.test(aliasOrName)){
                return res.status(599).json({
                    error: "Invalid course name"
                })
            }else if(aliasOrName && aliasOrName.length > 45){
                return res.status(599).json({
                    error: "Course name is too long"
                })
            }
            if(definition.parts.length > MAX_PARTS){
                return res
                    .status(400)
                    .json({error: "Golf course too big, remove some parts" })
            }
            if (process.env.PROD && !(await runChecks(req, VALID_PARCELS))) {
                return res
                    .status(400)
                    .json({ valid: false, error: "Validation error, try from another Realm" })
            }
            const authchain0 = await JSON.parse(req.header(`x-identity-auth-chain-0`));
            if(address !== "admin-editor" && authchain0.payload.toLowerCase() !== address.toLowerCase()){
                return res.status(500).json({error:"Error x"});
            }

            if(foundCourse?.createdBy !== address){
                return res.status(400).send({error:{message:"not found course created by address"}})
            }
            /* if((JSON.stringify(definition)=== foundCourse?.definition || JSON.stringify(definition) === foundCourseModification?.definition)
                 && (JSON.stringify(metadata) === foundCourse?.metadata || JSON.stringify(metadata) === foundCourseModification?.metadata)
             ){
                 return res.send(foundCourseModification?.definition || foundCourse.definition);
             }*/
            /*await prisma.courses.update({
                where:{
                    ID:foundCourse.ID
                },
                data:{
                    status:foundCourse.status === 3?3:0
                }
            });*/
            if(foundCourseModification){
                const data = {
                    definition:JSON.stringify(definition),
                    metadata:JSON.stringify(metadata),
                    status:0,
                    created:new Date().toISOString(),
                    displayName
                };
                return await tryPrisma(req,res)(prisma.course_modification.update, {
                    where:{
                        ID:foundCourseModification.ID
                    },
                    data
                })
            }else{
                const data = {
                    definition:JSON.stringify(definition),
                    metadata:JSON.stringify(metadata),
                    course_ID:ID,
                    status:0,
                    created:new Date().toISOString(),
                    displayName
                }
                return await tryPrisma(req,res)(prisma.course_modification.create, {
                    data
                })
            }
        }catch(error){
            console.log("error",error)
        }


    });

    router.post(`/api/editor-course-validate`, async (req, res)=>{
        const {apiKey, alias} = req.body;
        console.log("Validate", alias);
        if(apiKey !== process.env.GOLF_API_KEY){
            console.log("Wrong auth");
            return res.status(400).send({error:{message:"NON AUTH"}});
        }
        const foundCourse = await prisma.courses.findFirst({where:{alias}});
        const foundModification = await prisma.course_modification.findFirst({where:{course_ID:foundCourse.ID}});
        if(foundModification){
            await prisma.course_modification.update({
                data:{
                    status:foundModification.status === 3?3:4
                },
                where:{ID:foundModification.ID}
            });
        }else if(foundCourse){
            await prisma.courses.update({
                data:{
                    status:foundCourse.status === 3?3:4
                },
                where:{ID:foundCourse.ID}
            });
        }
        return res.send({ok:true});
    });

    router.put(`/api/set-course-data`, async (req, res)=>{
        try {
            const {where, data, GOLF_API_KEY} = req.body;
            if(process.env.GOLF_API_KEY !== GOLF_API_KEY){
                console.log("error: wrong api key");
                return res.status(500).send({error:"Wrong api key"});
            }
            console.log("updating course", {data, where})
            const result = await prisma.courses.update({
                where,
                data
            });
            console.log("result", result);
            return res.send({ok:true, result});
        }catch (error){
            console.log("error",error);
            return res.status(500).send({error})
        }
    });
    router.put(`/api/set-course-modification-data`, async (req, res)=>{
        try {
            const {data, GOLF_API_KEY, where} = req.body;
            if(process.env.GOLF_API_KEY !== GOLF_API_KEY){
                console.log("error: wrong api key");
                return res.status(500).send({error:"Wrong api key"});
            }
            console.log("updating course modification", {data, where})
            const result = await prisma.course_modification.update({
                where,
                data
            });
            console.log("result", result);
            return res.send({ok:true, result});
        }catch (error){
            console.log("error",error);
            return res.status(500).send({error})
        }
    });
    router.put(`/api/course`, authMiddleware, async (req, res)=>{
        const {ID, alias, data} = req.body;
        const {definition} = data;
        const createdBy = data.createdBy.toLowerCase() || "admin";
        const course_ID = ID;
        const foundCourseModification = await prisma.course_modification.findFirst({
            where:{course_ID}
        });
        const foundCourse = await prisma.courses.findFirst({
            where:{ID:course_ID}
        });
        if((JSON.stringify(definition) === foundCourse?.definition) || (JSON.stringify(definition) === foundCourseModification?.definition)){
            return res.send(foundCourseModification?.definition || foundCourse.definition);
        }
        if(!foundCourseModification){
            return await tryPrisma(req, res)(prisma.course_modification.create, {
                data:{...data, ID:undefined, course_ID:ID, created:new Date().toISOString()}
            }).then(r=>{
                console.log("CREATED course_modification", JSON.stringify({ID, alias, data}));
                return r;
            });
        }else{
            return await tryPrisma(req, res)(prisma.course_modification.update, {
                where:{ID:foundCourseModification.ID},
                data:{...data, ID:undefined, course_ID:ID, created:new Date().toISOString()}
            }).then(r=>{
                console.log("CREATED course_modification", JSON.stringify({ID, alias, data}));
                return r;
            });
        }

    });

    router.get(`/api/get-part/:ID`, async (req, res) => {
        const {ID} = req.params;
        return await tryPrisma(req,res)(prisma.parts.findUnique, {
            where:{ID:Number(ID)}
        });
    });

    router.post(`/api/get-part`, async (req, res) => {
        const {ID, alias} = req.body;

        return await tryPrisma(req,res)(prisma.parts.findUnique, {
            where:ID
                ? { ID }
                : { alias }
        });
    });

    router.post(`/api/parts`, async (req, res) => {
        const {where} = req.body;
        return await tryPrisma(req,res)(prisma.parts.findMany, {
            where
        });
    });
    router.post(`/api/parts-wip`, async (req, res) => {
        try{
            const {where} = req.body;
            const parts = await prisma.parts.findMany({
                where
            });
            const partModifications = await prisma.part_modification.findMany({
                where:{
                    NOT:{
                        status:2
                    }
                }
            });

            return res.send(parts.map(part => {
                const partModification = partModifications.find(p => p.part_ID === part.ID);
                if(!partModification) return part;
                return {
                    ...part,
                    ...partModification,
                    alias:partModification.alias || part.alias
                };
            }));
        }catch(e){
            return res.status(500).send({message:"problem "+ (e?.message || e)})
        }
    });

    router.get(`/api/get-material-drops`, async (req, res)=>{
        const materialDrops = await prisma.material_drops.findMany()

        return res.send(materialDrops);
    });

    router.post(`/api/part`, authMiddleware, async (req, res) => {
        return await tryPrisma(req, res)(prisma.parts.create, {
            data:{...req.body, created:new Date().toISOString()}
        }).then(r=>{
            return r;
        });
    });

    router.put(`/api/part`, authMiddleware, async (req, res) => {
        const {ID, alias, data} = req.body;
        const {definition, boundingBox, thumbnail64} = data;
        const part_ID = ID;
        const foundPartModification = await prisma.part_modification.findFirst({
            where:{
                part_ID
            }
        });
        const foundPart = await prisma.parts.findFirst({
            where:{ID:part_ID}
        });

        if(foundPartModification){
            return await tryPrisma(req, res)(prisma.part_modification.update, {
                where:{ID:foundPartModification .ID},
                data:{...data, status:0, created:new Date().toISOString()}
            }).then(r=>{
                console.log("UPDATE part", JSON.stringify({ID, alias, data}));
                return r;
            });
        }else{
            return await tryPrisma(req, res)(prisma.part_modification.create, {
                data:{...data, status:0, part_ID:ID, created:new Date().toISOString()}
            }).then(r=>{
                console.log("UPDATE part", JSON.stringify({ID, alias, data}));
                return r;
            });
        }

    });
console.log("-")
    router.all(`/api/playfab-hook`,async (req, res) => {
        const result = await processHookRequest(req);
        return res.send({ok:true, result})
    });

    const tryPrisma = (req, res) => async (fn, options) => {
        try{
            return await fn(options).then((r)=>{
                if(!r){
                    return res.status(404).send(r);
                }else{
                    return res.send(r)
                }
            });
        }catch(err){
            console.error(err);
            if(err instanceof PrismaClientValidationError){
                console.error("Wrong query", req.method, req.params, req.body);
                return res.status(400).send({message:"Wrong query"});
            }else{
                console.error(err);
                return res.status(400).send({message:"Error"});
            }
        }
    }
}



function generateString(length) {
    const characters ='abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}