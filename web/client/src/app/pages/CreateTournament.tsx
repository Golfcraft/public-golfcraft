import React, { useState, useContext, useEffect } from "react";
import {resolveFetch, resolvePost} from '../../lib/http';

import "./CreateAd.scss";
import { getSignatureMessage, SIGN_MESSAGE } from "../../../../common/signatures";
import { useQuery, requestPayment} from "./pageUtils";
import {Button, Field, Message, Form, Header, Radio, Row, TextArea, Label, LabelDetail} from "decentraland-ui";
import {getAllowedWearableNames, getAllWearablesAllowedNames, hasAllowedWearables} from "../../../../common/wearables";
import {timestampToDatetimeInputString} from "../../lib/date";
import {AppContext} from "../AppContext";
import {getCatFromTier, getRandomFromList, getTierFromSub, shuffle} from "../../../../../common/utils";

const Web3 = require('web3');
declare const ethereum;
export const web3 = window?.ethereum && new Web3(ethereum) || null;
//TODO add maxLength
const STATUS = {
    IDLE:"IDLE",
    SENDING:"SENDING"
};
declare const DEV_MODE;
const requestCreateAdSignature = async (address, data) => {
    return await ethereum.request({method:"personal_sign", params:[getSignatureMessage(SIGN_MESSAGE.CREATE_AD, JSON.stringify(data)), address]});
};

export const CreateTournament = () => {
    const {contextState}:any = useContext(AppContext);
    const {selectedAddress} = contextState;
    const urlQuery = useQuery()||{};
    const {id} = urlQuery;
    const [data, setData] = useState({
        organizer:selectedAddress.toLowerCase(),
        max_participants:8,
        useOwnCourses:true,
        start_date:Date.now(),
        whitelist:[],
        min_level:0,
        courses:[],
        comment:"",
        is_live_tournament:false,
        expiration_date:Date.now() + (1000*60*60*4)//in 4 hours
    });
    const [participate, setParticipate] = useState(true);
    const [isPrivate, setIsPrivate] = useState(false);
    const [whitelistedAddresses, setWhitelistedAddresses] = useState("");
    const [adRequestStatus, setAdRequestStatus] = useState(STATUS.SENDING);
    const [validationErrors, setValidationErrors] = useState([] as string[]);
    const [checkingWearables, setCheckingWearables] = useState(true);
    const [isWearablesAllowed, setIsWearablesAllowed] = useState(false);
    const [ownedWearables, setOwnedWearables] = useState([]);
    const [ownCourses, setOwnCourses] = useState([]);
    const [useOwnCourses, setUseOwnCourses] = useState(true);
    const [courses, setCourses] = useState("");
    const [tier, setTier] = useState(0);
    const [loading, setLoading] = useState(false);
    const BASE_URL = false?"http://localhost:2569":"https://golfcraftgame.com";

    useEffect(()=>{
        (async() => {
           const wearables = await resolveFetch(`https://peer.decentraland.org/lambdas/collections/wearables-by-owner/${selectedAddress}`);
           const myCourses = await resolvePost(BASE_URL+`/api/courses`, {where:{
               createdBy: selectedAddress.toLowerCase(),
               status:2
           }});
           const maxTierCatToSelectMap = getCatFromTier(getTierFromSub(await fetch(BASE_URL+"/api/get-player-tier-sub/"+selectedAddress, {method:"GET", headers:{"Content-Type":"application/json"}}).then(r=>r.json())||0));
           setTier(maxTierCatToSelectMap);
           const _courses = shuffle(myCourses).splice(0,12);
           let courseQuery = {
                "query": {
                    "where": {
                        "minTierCat": {"lte": maxTierCatToSelectMap||0},
                        "isSeason": 1
                    }
                },
                "table": "courses"
           };

           while(_courses.length < 12) {
               try{
                   const alias = (await resolvePost(BASE_URL+"/api/get-random-row?r="+Math.random(), courseQuery))?.alias;
                   if(alias) _courses.push(alias);
               }catch(error){
                   console.log("error",error)
               }
           }

           setOwnCourses(myCourses);
           setCourses(_courses.map(c=>c.alias).join(", "));
           setIsWearablesAllowed(!!hasAllowedWearables(wearables))
           setCheckingWearables(false);
            const owned = getAllowedWearableNames(wearables);
            setOwnedWearables(owned )
           setAdRequestStatus(STATUS.IDLE);
        })();
    },[])
    async function randomizeCourses(){
        setLoading(true);
        const _courses = data.useOwnCourses?shuffle(ownCourses).splice(0,12):[];
        let courseQuery = {
            "query": {
                "where": {
                    "minTierCat": {"lte": tier||0},
                    "isSeason": 1
                }
            },
            "table": "courses"
        };

        while(_courses.length < 12) {
            _courses.push(await resolvePost(BASE_URL+"/api/get-random-row?r="+Math.random(), courseQuery));
        }

        setCourses(_courses.map(c=>c.alias||c.courseAlias).join(", "));
        setLoading(false)
    }
    const submit = async () => {
        if(isSubmitDisabled()) return;
        if(adRequestStatus !== STATUS.IDLE) return;
        if(!(await validate())) return;

        setAdRequestStatus(STATUS.SENDING);
        const dataToSubmit = {
            address:selectedAddress,
            courseAliases:courses.split(", ").map(c=>c.trim()),
            ...data
        };

        let signature;
        try {
            signature = await requestCreateAdSignature(selectedAddress, data);
        }catch(err){
            setAdRequestStatus(STATUS.IDLE);
            return Promise.reject({message:"SIGNING_ERROR"});
        }

        if(!signature){
            setAdRequestStatus(STATUS.IDLE);
            return Promise.reject({message:"SIGNING_ERROR"});
        }
        await resolvePost(`/api/create-tournament`, dataToSubmit).then(({ID, code})=>{
            alert("tournament created with code: "+code);
            location.href=(DEV_MODE?"":"")+"/view-tournament?code="+code;
        }, (err)=>{
            alert("error creating tournament");
        })
    }

    const isSubmitDisabled = () => {
        return adRequestStatus === STATUS.SENDING;
    }

    return <Form>
          <Header size="large">Create tournament</Header>
        <br/>
        <br/>
        {
            checkingWearables && "checking wearables ..." ||""
        }
        {
            !checkingWearables && !isWearablesAllowed && (<p>Missing necessary wearables to create a tournament, ask in our<a href={"http://discord.gg/2tshKm6UzJ"}>&nbsp;discord chat</a></p>)
        }
        {
            !checkingWearables && isWearablesAllowed && (
                <>
                    <Header onClick={(event)=> setData({...data, is_live_tournament: !data.is_live_tournament})}>LIVE TOURNAMENT</Header>
                    <div onClick={(event)=> setData({...data, is_live_tournament: !data.is_live_tournament})} >(all participants must play at the same time when the organizer starts the game)</div>
                    <Field id="is_live_tournament" disabled={loading} type="checkbox" checked={data.is_live_tournament} onChange={(event)=> setData({...data, is_live_tournament: !data.is_live_tournament})} />
                </>
            )
        }
        {
            !checkingWearables && isWearablesAllowed && (<>
                    <Field id="max_participants" type="number" label="Max participants" value={data.max_participants} onChange={(event)=>handleChange(event)} />
                    <Field id="min_level" type="number" label="Minimum player level" value={data.min_level} onChange={(event)=>handleChange(event)} />
                    <Field id="start_date" type="datetime-local" label="Start date time" value={timestampToDatetimeInputString(data.start_date)} onChange={(event)=>handleChange(event)}/>
                    <Field id="expiration_date" type="datetime-local" label="Expiration date time"
                           value={timestampToDatetimeInputString(data.expiration_date)}
                           onChange={(event)=>handleChange(event)}
                           disabled={data.is_live_tournament}
                    />
                    <Header sub>I participate</Header>
                    <Field id="participate" type="checkbox" checked={participate} onChange={()=>setParticipate(!participate)} />
                    <fieldset>
                        <Header sub>Use own courses</Header>
                        <Field id="useOwnCourses" disabled={loading} type="checkbox" checked={data.useOwnCourses} onChange={(event)=> setData({...data, useOwnCourses: !data.useOwnCourses})} />                 <Field id="tier" disabled={loading} type="number" max={9} min={0} label="Rank courses (from wood to supreme 0-9, default is player tier)" value={tier||0} onChange={(event)=>setTier(Number(event.target.value))} />
                        <Field id="courses" disabled={loading} type="text" label="Courses" value={courses} onChange={(event) => setCourses(event.target.value) } />
                        <Button label={"Randomize"} onClick={()=>randomizeCourses()} />
                    </fieldset>
                    <Header sub>Private</Header>
                    <Field id="isPrivate" type="checkbox" checked={isPrivate} onChange={()=>setIsPrivate(!isPrivate)} />
                {isPrivate && <><Header sub>Whitelisted addresses (1 per line)</Header>

                    <TextArea id="whitelist" rows={8} value={(data.whitelist||[]).join("\n")} onChange={(event)=>handleChange(event)}></TextArea></>}

                <Header sub>Comment (To explain prizes, etc.)</Header>
                    <TextArea id="comment" Label={"ASD"} rows={3} maxLength={100} value={data.comment} onChange={(event)=>handleChange(event)}></TextArea>


                    <br/><br/>
                {validationErrors?.length && validationErrors.map(validationError => {
                    return <div key={validationError} style={{color:"red"}}>{validationError}</div>
                }) || ""}
                    <Row>
                        <Button disabled={isSubmitDisabled()} primary onClick={()=>submit()} >Submit</Button>
                    </Row>
            </>) ||""
        }
        {
            ownedWearables?.length && <div><br/><br/><b>Owned wearables:</b>
                {
                    ownedWearables.map(name=>{
                        return <div key={name}>{name}</div>
                    })
                }
            </div> || null
        }
        {
            <div><br/><br/><b>Need any of the following wearables in order to create a tournament:</b>
                {
                    getAllWearablesAllowedNames().map(name=>{
                        return <div key={name}>{name}</div>
                    })
                }
            </div>
        }
    </Form>;

   async function validate(){
        const errors = [];
        if(!data.is_live_tournament && data.expiration_date < data.start_date) errors.push("Expiration date must be higher than start date");
        if(!data.is_live_tournament && !data.expiration_date) errors.push("Missing expiration date");
        if(!data.start_date) errors.push("Missing start date");
        if(isPrivate && !data.whitelist.filter(i=>i).length) errors.push("Need to set whitelisted addresses for a private tournament");
        const courseAliases = courses.split(", ").map(c=>c.trim());
        if(courseAliases.length !== 12){
            errors.push("Need 12 courses")
        }else{
            for(let courseAlias of courseAliases){
                if(!(await fetch(`${BASE_URL}/api/get-course`, {method:"POST",headers:{"Content-Type":"application/json"}, body:JSON.stringify({
                        alias:courseAlias
                    })}).then(r=>r.json()))){
                    errors.push("Wrong courses")
                }
            }
        }

        setValidationErrors(errors);
        return !errors.length;
    }

    function handleChange(event){
        if(event.target.type === "datetime-local") {
            setData({...data, [event.target.id]: localDateTimeToDate(event.target.value).getTime()})
        }else if(event.target.id === "whitelist" || event.target.id === "courses") {
            setData({...data, [event.target.id]: event.target.value.split("\n").map(i=>i.trim())});
        }else if(event.target.type === "number") {
            setData({...data, [event.target.id]: Number(event.target.value)})
        }else{
            setData({...data, [event.target.id]:event.target.value})
        }
    }

    function localDateTimeToDate(dateTimeLocal){
        return (new Date(dateTimeLocal));
    }
};