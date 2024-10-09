import {
    countTournaments,
    getTournamentDataByCode,
    getTournamentDataByID, getTournaments,
    insertTournament,
    insertTournamentParticipant, updateTournamentParticipant
} from "../../../utils/db";
import fetch from "cross-fetch";
import {hasAllowedWearables} from "../../../common/wearables";
import {getCompleteParticipationsCount, getLastSentRewardPoints} from "../../../common/tournament-creator-report";
import {PlayFabServer} from "playfab-sdk";
import {promisify} from "util";
import {handleParticipationsRewards} from "./handle-tournament-organizer-rewards";

export const tournamentApi = (router, prisma) => {

    router.get("/api/tournament-rewards", async (req, res)=>{
        const {organizer, organizer_display_name} = req.query;
        return res.send(await handleParticipationsRewards(prisma, {organizer, organizer_display_name}));
    });

    router.post(`/api/check-tournament-organizer-rewards`, apiKeyMiddleware, async (req, res) => {
        const {organizer_display_name, organizer} = req.body;

        const {
            completeParticipationsCount,
            lastSentRewardPoints,
            currentParticipationMilestoneIndex,
            lastSentRewardMilestoneIndex,
            nextRewardMilestone
        } = await handleParticipationsRewards(prisma, {organizer, organizer_display_name});

        return res.send({
            completeParticipationsCount,
            lastSentRewardPoints,
            currentParticipationMilestoneIndex,
            lastSentRewardMilestoneIndex,
            nextRewardMilestone
        });
    });

    router.post(`/api/sum-live-tournament-participation`, apiKeyMiddleware, async (req, res) => {
        const {organizer, points, organizer_display_name} = req.body;
        const where = {
            organizer
        };
        const organizerCount = (await prisma.live_tournament_participations.findFirst({where}));
        const currentCount = organizerCount?.points || 0;

        const result =organizerCount? await prisma.live_tournament_participations.updateMany({
            where,
            data:{
                points:currentCount + points
            }
        }): await prisma.live_tournament_participations.create({
          data:{
              organizer:organizer.toLowerCase(),
              points
          }
        });
        console.log("currentCount + points",currentCount + points)
        handleParticipationsRewards(prisma,{organizer, organizer_display_name})
        return res.send(result);
    })

    router.post('/api/get-tournament-by-id', async (req, res)=>{
        const {ID} = req.body;

        const tournamentData = await getTournamentDataByID(ID);
        console.log("get-tournament-by-id", tournamentData);
        if(!tournamentData) return res.status(404).send();

        return res.send({
            ...tournamentData,
            courses:tournamentData.courses.split(","),
            whitelist:tournamentData.whitelist && JSON.parse(tournamentData.whitelist) || null,
            participants:tournamentData.participants.map(p=>{
                return {
                    ...p,
                    data:JSON.parse(p.data)
                };
            })
        });
    });

    router.post('/api/get-tournament-by-code', async (req, res)=>{
        const {code} = req.body;
        const tournamentData = await getTournamentDataByCode(code);

        if(!tournamentData) return res.status(404).send();

        return res.send({
            ...tournamentData,
            courses:tournamentData.courses.split(","),
            whitelist:tournamentData.whitelist && JSON.parse(tournamentData.whitelist) || null,
            min_level:tournamentData.min_level,
            participants:tournamentData.participants.map(p=>{
                return {
                    ...p,
                    data:p.data && JSON.parse(p.data) || undefined
                };
            })
        });
    });

    //TODO protect with api_key, and IP?
    router.post('/api/add-tournament-participant', async (req, res) => {
        const {ID, address, playfab, data, displayName} = req.body;
        const tournamentData = await getTournamentDataByID(ID);
        if(Date.now() < (tournamentData.start_date*1000 - (1000*60*5))){//5min of span due to unsync clocks
            return res.status(400).send({message:"NOT YET STARTED", tournamentData, now:Date.now()});
        }
        if(Date.now() > (tournamentData.expiration_date*1000)){
            return res.status(400).send({message:"FINISHED", tournamentData, now:Date.now()});
        }
        if(tournamentData.max_participants <= tournamentData.participants.length){
            return res.status(400).send({message:"NO MORE PARTICIPATIONS", tournamentData});
        }
        if(tournamentData.participants.find(p=>p.address === address)){
            return res.status(400).send({message:"ALREADY PARTICIPATING", tournamentData});
        }
        const result = await insertTournamentParticipant({ID, address, playfab, data:JSON.stringify(data), displayName});
        res.status(200).send({result});
    });

    //TODO protect with api_key, and IP?
    router.post(`/api/update-tournament-participant`, async (req, res)=>{
        const {ID, address, playfab, data} = req.body;
        console.log("update-tournament-participant", ID, address, playfab, data)
        const result = await updateTournamentParticipant({ID, address, data:JSON.stringify(data)});
        return res.send(result);
    });

    router.post(`/api/create-tournament`, async (req, res)=>{
        console.log("CREATE-TOURNAMENT", JSON.stringify( req.body) );
        const {organizer, useOwnCourses, courseAliases, comment, signature, email, whitelist, max_participants, expiration_date, start_date, min_level, is_live_tournament} = req.body;
        const PlayFabId = (await getPlayFabIdFromAddresses([organizer]))[0];
        const organizer_display_name = await promisify(PlayFabServer.GetUserAccountInfo)({PlayFabId}).then(r => r?.data?.UserInfo?.TitleInfo?.DisplayName);

        if(typeof max_participants !== "number" || max_participants > 65534){
            return res.status(403).send({message:"too many participants"});
        }
        const addressWearables = await fetch(`https://peer.decentraland.org/lambdas/collections/wearables-by-owner/${organizer}`).then(r=>r.json());
        const isAllowedByWearable = hasAllowedWearables(addressWearables);
        if(!isAllowedByWearable){
            return res.status(403).send({message:"Missing wearables"})
        }

        const {ID, code} = await insertTournament({
            organizer,
            organizer_display_name,
            whitelist:whitelist?.length && JSON.stringify(whitelist) || null,
            max_participants,
            expiration_date:Math.floor(expiration_date/1000),
            start_date:Math.floor(start_date/1000),
            courses:courseAliases,
            min_level:min_level||0,
            comment,
            is_live_tournament
        });

        return res.send({ID, code});
    });

    router.post(`/api/get-tournaments`, async (req, res)=>{
        const {start, limit, filter} = req.body;
        const results = await getTournaments({start,limit, filter});
        const total = await countTournaments({filter});
        res.send({results, total});
    });

    const tournamentParticipationCache:{[address:string]:{date:number, value:any}} = {

    }
    const HOUR = 1000 * 60 * 60;
    router.get(`/api/tournament-creator-report/:organizer`, async (req, res)=>{
        //TODO cache by organizer for 24 hours?
        try{
            const organizer = req.params.organizer.toLowerCase();
            const cached = tournamentParticipationCache[organizer.toLowerCase()];
            if(cached && cached.value){
                if(((Date.now() - new Date(cached.date).getTime()) < HOUR)){
                    console.log("cached",cached)
                    return res.send(cached.value);
                }
            }
            const completeParticipationsCount = await getCompleteParticipationsCount({organizer:organizer.toLowerCase(), prisma});
            const lastSentRewardPoints = await getLastSentRewardPoints({organizer:organizer.toLowerCase(), prisma});

            tournamentParticipationCache[organizer.toLowerCase()] = {
                date:Date.now(),
                value: {completeParticipationsCount, lastSentRewardPoints}
            }

            return res.send(tournamentParticipationCache[organizer.toLowerCase()].value);
        }catch (e){
            res.status(500).send({error:e?.message});
        }
    });

    async function getPlayFabIdFromAddresses(addresses){
        const GenericIDsBody = {
            GenericIDs:[
                ...addresses.map(address => ({
                    ServiceName:"address",
                    UserId:address?.toLowerCase() || "notexists"
                }))
            ]
        }
        return await promisify(PlayFabServer.GetPlayFabIDsFromGenericIDs)(GenericIDsBody).then(r=>r.data.Data.map(d=>d.PlayFabId), (error)=>{
            console.error("error", error);
            return addresses.map(m=>null);
        });
    }
}

async function apiKeyMiddleware(req, res, next){
    const { apiKey} = req.body;
    if(apiKey !== process.env.GOLF_API_KEY){
        return res.status(500).send({error:"wrong api key: "+apiKey})
    }
    next();
}