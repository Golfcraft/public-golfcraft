import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../AppContext";
import {useQuery} from "./pageUtils";
import {resolveFetch, resolvePost} from "../../lib/http";
import "./CreateAd.scss";
import { getSignatureMessage, SIGN_MESSAGE } from "../../../../common/signatures";
import {
    Button,
    Field,
    Form,
    Header,
    Row,
    Table,
    TableHeader,
    TableHeaderCell,
    TableRow,
    TextArea
} from "decentraland-ui";
import {timestampToDatetimeInputString} from "../../lib/date";
import {getParticipantScores} from "../../../../../common/tournament-results";
import {Link} from "react-router-dom";
const DEFAULT_MIN_SHOOTS= 12;
export const ViewTournament = () => {
    const {code} = useQuery()||{};
    const [tournamentData, setTournamentData] = useState({
        max_participants:null,
        start_date:0,
        expiration_date:0,
        whitelist:[],
        participants:[],
        comment:"",
        is_live_tournament:false
    });

    useEffect(()=>{
        (async() => {
            const data = await resolvePost(`/api/get-tournament-by-code`, {code}).then(data => {
                const participantScores = getParticipantScores(data.participants);
                console.log("participantScores",participantScores, data);
                Object.values(data.participants).forEach((participant:any, pIndex) => {
                    participant.data.courseStates = participant.data?.courseStates.map((hole, holeIndex) => {
                        return {
                            ...hole,
                            score:participantScores[participant.participationID][holeIndex]
                        }
                    })
                });
                setTournamentData(data);
            });

        })();
    },[]);
    return <Form>
        <Header size="large">Tournament {code}</Header>
        {tournamentData?.is_live_tournament && <div><b>LIVE TOURNAMENT:</b> all participants must play at the same time when the organizer starts the game</div>}
        <br/>
        <div>Organizer: <Link to={`/courses?address=${tournamentData.organizer}`}>{tournamentData.organizer}</Link></div>
        <div>Max participants: {tournamentData.max_participants}</div>
        <div>Minimum level: {tournamentData.min_level || 0}</div>
        <div>Finished: {tournamentData.finished && "yes" || "no"}</div>
        <div>Comment:</div>
        <div>{tournamentData.comment}</div>
        <br/>
        <div>Start date: <input disabled type="datetime-local" value={timestampToDatetimeInputString(tournamentData.start_date*1000)} />
            <span className={"grey"}>{new Date(tournamentData.start_date*1000).toISOString()}</span>
        </div>
        <br/>
        <div>Expiration date: <input disabled type="datetime-local" value={timestampToDatetimeInputString(tournamentData.expiration_date*1000)} />
            <span className={"grey"}>{new Date(tournamentData.expiration_date*1000).toISOString()}</span>
        </div>
        {tournamentData?.whitelist?.length && <>
            <div>Whitelist:</div>
            <TextArea value={tournamentData.whitelist?.join("\n")}></TextArea><br/>
        </> || ""}

        <br/><br/>

        <div>Participants summary</div>
        <div>
            <Table padded={true} basic="very" size="small" style={{width:'100%', textAlign:'center', margin:0}}>
                <Table.Header>
                        <Table.HeaderCell>Position</Table.HeaderCell>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Address</Table.HeaderCell>
                        <Table.HeaderCell>Games</Table.HeaderCell>
                        <Table.HeaderCell>Missed hole</Table.HeaderCell>
                        <Table.HeaderCell>Shots</Table.HeaderCell>
                        <Table.HeaderCell>Score</Table.HeaderCell>
                </Table.Header>
                <Table.Body>
                {
                    !tournamentData.participants?.length && <tr><td colSpan={3}>Empty</td></tr> || ""
                }
                {//TODO if not finished dont show results
                    tournamentData.participants?.length && tournamentData.participants
                        .filter(p=>p?.data?.courseStates?.length === 12)
                        .sort(sortParticipantsFn(tournamentData.participants))
                        .map((p,i)=>{
                        return <Table.Row>
                                    <Table.Cell>{i+1}</Table.Cell>
                                    <Table.Cell style={{textAlign:"left"}}>{p?.displayName}&nbsp;{participantFinishedAll(p) && "⛳" || ""}</Table.Cell>
                                    <Table.Cell>{p?.address}</Table.Cell>
                                    <Table.Cell>{p?.data?.courseStates?.length || 0}</Table.Cell>
                                    <Table.Cell>{p?.data?.courseStates?.length && p.data.courseStates.reduce((acc, current)=>{
                                        if(current.startTime && !current.holeTime){
                                            acc++;
                                        }
                                        return acc;
                                    },0)}</Table.Cell>
                                    <Table.Cell><>{getParticipantTotalShots(p)}</></Table.Cell>
                                    <Table.Cell><b>{getParticipantTotalScore(p)}</b></Table.Cell>
                            </Table.Row>
                    })

                    || ""
                }
                    </Table.Body>
            </Table>
        </div>
        <br/><br/>
        <div>
            Participants detailed
        </div>
        <div>
            <Table padded={true} basic="very" size="small" style={{width:'100%', textAlign:'center', margin:0}}>
                <Table.Header>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>1</Table.HeaderCell>
                    <Table.HeaderCell>2</Table.HeaderCell>
                    <Table.HeaderCell>3</Table.HeaderCell>
                    <Table.HeaderCell>4</Table.HeaderCell>
                    <Table.HeaderCell>5</Table.HeaderCell>
                    <Table.HeaderCell>6</Table.HeaderCell>
                    <Table.HeaderCell>7</Table.HeaderCell>
                    <Table.HeaderCell>8</Table.HeaderCell>
                    <Table.HeaderCell>9</Table.HeaderCell>
                    <Table.HeaderCell>10</Table.HeaderCell>
                    <Table.HeaderCell>11</Table.HeaderCell>
                    <Table.HeaderCell>12</Table.HeaderCell>
                    <Table.HeaderCell>Total shots</Table.HeaderCell>
                    <Table.HeaderCell>Total time</Table.HeaderCell>
                    <Table.HeaderCell>Total score</Table.HeaderCell>
                </Table.Header>


                <Table.Body>
                    {
                        tournamentData.participants?.length && tournamentData.participants.sort(sortParticipantsFn(tournamentData.participants)).map(p=>{
                            return <Table.Row key={p.address}>
                                <Table.Cell>{p?.displayName}&nbsp;{participantFinishedAll(p) && "⛳" || ""}</Table.Cell>
                                <Table.Cell><span>{p.data.courseStates[0]?.score}</span> <span className={"grey"}>{getParticipantShotsAtIndex(p,0)}</span></Table.Cell>
                                <Table.Cell><span>{p.data.courseStates[1]?.score}</span> <span className={"grey"}>{getParticipantShotsAtIndex(p,1)}</span></Table.Cell>
                                <Table.Cell><span>{p.data.courseStates[2]?.score}</span> <span className={"grey"}>{getParticipantShotsAtIndex(p,2)}</span></Table.Cell>
                                <Table.Cell><span>{p.data.courseStates[3]?.score}</span> <span className={"grey"}>{getParticipantShotsAtIndex(p,3)}</span></Table.Cell>
                                <Table.Cell><span>{p.data.courseStates[4]?.score}</span> <span className={"grey"}>{getParticipantShotsAtIndex(p,4)}</span></Table.Cell>
                                <Table.Cell><span>{p.data.courseStates[5]?.score}</span> <span className={"grey"}>{getParticipantShotsAtIndex(p,5)}</span></Table.Cell>
                                <Table.Cell><span>{p.data.courseStates[6]?.score}</span> <span className={"grey"}>{getParticipantShotsAtIndex(p,6)}</span></Table.Cell>
                                <Table.Cell><span>{p.data.courseStates[7]?.score}</span> <span className={"grey"}>{getParticipantShotsAtIndex(p,7)}</span></Table.Cell>
                                <Table.Cell><span>{p.data.courseStates[8]?.score}</span> <span className={"grey"}>{getParticipantShotsAtIndex(p,8)}</span></Table.Cell>
                                <Table.Cell><span>{p.data.courseStates[9]?.score}</span> <span className={"grey"}>{getParticipantShotsAtIndex(p,9)}</span></Table.Cell>
                                <Table.Cell><span>{p.data.courseStates[10]?.score}</span> <span className={"grey"}>{getParticipantShotsAtIndex(p,10)}</span></Table.Cell>
                                <Table.Cell><span>{p.data.courseStates[11]?.score}</span> <span className={"grey"}>{getParticipantShotsAtIndex(p,11)}</span></Table.Cell>
                                <Table.Cell>{getParticipantTotalShots(p)}</Table.Cell>
                                <Table.Cell>{convertMillisecondsToDigitalClock(getParticipantTotalTime(p))}</Table.Cell>
                                <Table.Cell>{getParticipantTotalScore(p)}</Table.Cell>
                            </Table.Row>
                        })
                    }
                </Table.Body>
            </Table>
        </div>
        <br/>
        <br/>
    </Form>;
    function getParticipantTimeAtIndex(participant, courseIndex){
        if(!(participant?.data?.courseStates && participant?.data?.courseStates[courseIndex]?.holeTime)){
            return null;
        }
        return participant?.data?.courseStates[courseIndex]?.holeTime - participant?.data?.courseStates[courseIndex]?.startTime;
    }
    function getParticipantTotalScore(p){
        return p?.data?.courseStates.reduce((acc,h)=>acc+h.score, 0) || 0;
    }
    function getParticipantTotalShots(p){
        let i = 0;
        let total = 0;
        while(i < 12){
            const indexShots = getParticipantShotsAtIndexNormalized(p, i);
            if(indexShots){
                total += indexShots
            }
            i++;
        }
        return total;
    }

    function getParticipantTotalTime(p){
        return Array(12).fill(0).map((c, index)=>{
            return getParticipantTimeAtIndex(p, index) || 0
        }).reduce((acc, current)=>{
            return acc+current;
        },0);
    }

    function getParticipantShotsAtIndexNormalized(participant, courseIndex){
        if(
            (participant?.data?.courseStates && !participant?.data?.courseStates[courseIndex]?.holeTime && participant?.data?.courseStates[courseIndex]?.finished)
            || (participant?.data?.courseStates && !participant?.data?.courseStates[courseIndex]?.holeTime && participant?.data?.courseStates[courseIndex])
        ){
            const max = Math.max(DEFAULT_MIN_SHOOTS, participant.data?.courseStates.reduce((acc, course)=>{
                return Math.max(acc, course.shoots || 0);
            },0));

            if(max){
                return max + 2;
            }
            return null;
        }
        if(!(participant?.data?.courseStates && participant?.data?.courseStates[courseIndex]?.holeTime)){
            return null;
        }
        return participant?.data?.courseStates[courseIndex]?.shoots || null;
    }
    function getParticipantShotsAtIndex (participant, courseIndex){
        if(participant?.data?.courseStates && !participant?.data?.courseStates[courseIndex]?.holeTime && participant?.data?.courseStates[courseIndex]?.finished
            || (participant?.data?.courseStates && !participant?.data?.courseStates[courseIndex]?.holeTime && participant?.data?.courseStates[courseIndex])
        ){
            //TODO get maximum shot from all others
            const max = Math.max(participant.data?.courseStates.reduce((acc, course)=>{
                return Math.max(acc, course.shoots || 0);
            },0),DEFAULT_MIN_SHOOTS);
            console.log("max", max, participant);
            if(max){
                return <span style={{color:"red"}}>-</span>;
            }
            return "MISS";
        }
        if(!(participant?.data?.courseStates && participant?.data?.courseStates[courseIndex]?.holeTime)){
            return <span>-</span>;
        }
        return <>{participant?.data?.courseStates[courseIndex].shoots}<br/>{convertMillisecondsToDigitalClock(getParticipantTimeAtIndex(participant,courseIndex)||0)}</> || <span>-</span>;
    }
    function convertMillisecondsToDigitalClock(ms) {
        const hours = Math.floor(ms / 3600000), // 1 Hour = 36000 Milliseconds
            minutes = Math.floor((ms % 3600000) / 60000), // 1 Minutes = 60000 Milliseconds
            seconds = Math.floor(((ms % 360000) % 60000) / 1000) // 1 Second = 1000 Milliseconds

        return minutes.toString().padStart(2,"0") + ":" + seconds.toString().padStart(2,"0") + ":" + (ms%10).toString().padStart(2,"0");
    }
    function participantIsFinished(participant){
        return participant?.data?.courseStates?.length === 12 && participant?.data?.courseStates[11].finished;
    }

    function participantFinishedAll(participant){
        return participant?.data?.courseStates?.length && participant?.data?.courseStates.every(c=>c.holeTime);
    }

    function sortParticipantsFn(all){
        return function sortParticipants(a,b){
            if(!participantIsFinished(b) && participantIsFinished(a)) return -1;
            if(!participantIsFinished(a) && participantIsFinished(b)) return +1;
            //if(!participantFinishedAll(b) && participantFinishedAll(a)) return -1;
            //if(!participantFinishedAll(a) && participantFinishedAll(b)) return +1;
            /*if(!participantFinishedAll(a) && !participantFinishedAll(b)){
                return (b.data.courseStates.length) - (a.data.courseStates.length);
            }*/
            return (getParticipantTotalScore(b)*1000 - getParticipantTotalShots(b)) - (getParticipantTotalScore(a)*1000- + getParticipantTotalShots(a));
        }
    }

}