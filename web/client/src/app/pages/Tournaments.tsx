import React, { useState, useEffect } from "react";
import {Link} from "react-router-dom";
import "./MyLand.scss"

import {resolveFetch, resolvePost} from '../../lib/http';
import {
    AvatarFace,
    Header, Pagination,
    Table
} from "decentraland-ui";
import {getAvatars} from "../../lib/avatars";
import {useLocalStorage} from "../hooks/use-localstorage";

const PAGE_SIZE = 10;
const avatars = getAvatars();
export const Tournaments = () => {
    const [tournaments, setTournaments] = useState([]);
    const [range, setRange] = useState({start:0, limit:PAGE_SIZE});
    const [loading, setLoading] = useState(true);
    const [organizers, setOrganizers] = useState({});
    const totalPages = Math.ceil((tournaments?.total || 0 )/ PAGE_SIZE);
    const [,setAvatars] = useLocalStorage("avatars", {});
    const [alive, setAlive] = useState(true);
    const [onlyPublic, setOnlyPublic] = useState(true);

    useEffect(()=>{
        (async() => {
            setLoading(true);
            const tourneys = await resolvePost(`/api/get-tournaments`, {
                start:range.start,
                limit:range.limit,
                filter:{
                    onlyPublic,
                    alive
                }

            }).then(data => {
                console.log("data",data);
                return data || {results:[],total:0};
            })
            setTournaments(tourneys);
            const organizerAddresses:string[] = Array.from(new Set(tourneys.results.map(t=>t.organizer)));

            let i = organizerAddresses.length;
            while(i--){
                if(!avatars[organizerAddresses[i]]){
                    const profile = await resolveFetch(`https://peer-lb.decentraland.org/lambdas/profiles?id=${organizerAddresses[i]}`);
                    avatars[organizerAddresses[i]] = profile[0].avatars[0];
                }
            }
            setAvatars(avatars);
            setOrganizers(avatars);
            setLoading(false);
        })();
    },[range, alive, onlyPublic]);

    return <>
        <Header size="large">Tournaments ({tournaments?.total})</Header>
        <div>
            <label>Only public:&nbsp;<input type="checkbox" checked={onlyPublic} onChange={(event)=>setOnlyPublic(!onlyPublic)}/>&nbsp;&nbsp;</label>
            <label>Alive:&nbsp;<input type="checkbox" checked={alive} onChange={()=>setAlive(!alive)}/></label>
        </div>
        <div>
            <Table padded={true} basic="very" size="small" style={{width:'100%', textAlign:'center', margin:0}}>
                <Table.Header>
                    <Table.HeaderCell>Code</Table.HeaderCell>
                    <Table.HeaderCell>Organizer</Table.HeaderCell>
                    <Table.HeaderCell>Max participants</Table.HeaderCell>
                    <Table.HeaderCell>Start date</Table.HeaderCell>
                    <Table.HeaderCell>Expiration date</Table.HeaderCell>

{/*
                    <Table.HeaderCell>Organizer</Table.HeaderCell>
*/}
                    <Table.HeaderCell>Private</Table.HeaderCell>
                    <Table.HeaderCell>Finished</Table.HeaderCell>
                    <Table.HeaderCell>Min level</Table.HeaderCell>
                    <Table.HeaderCell>Comment</Table.HeaderCell>
                </Table.Header>
                <Table.Body style={{height:100}}>
                    {
                        !tournaments?.results?.length && <tr><td colSpan={3}>Empty</td></tr> || ""
                    }
                    {
                        !loading && tournaments?.results?.map((tournament)=>
                            <Table.Row key={tournament.ID}>
                                <Table.Cell><Link to={`./view-tournament?code=${tournament.code}`}>{tournament.is_live_tournament?<><b style={{backgroundColor:"#ff00ff", color:"white", padding:2}}>LIVE</b><br/></>:""}{tournament.code}</Link></Table.Cell>
                                <Table.Cell><Link to={`./view-tournament?code=${tournament.code}`}>{organizers && getAvatar(organizers[tournament.organizer]) || null}</Link></Table.Cell>
                                <Table.Cell><Link to={`./view-tournament?code=${tournament.code}`}>{tournament.max_participants}</Link></Table.Cell>
                                <Table.Cell><Link to={`./view-tournament?code=${tournament.code}`}>{formatSmallDate(tournament.start_date)}</Link></Table.Cell>
                                <Table.Cell><Link to={`./view-tournament?code=${tournament.code}`}>{formatSmallDate(tournament.expiration_date)}</Link></Table.Cell>
                                <Table.Cell><Link to={`./view-tournament?code=${tournament.code}`}>{tournament.whitelist?.length && "yes" || "no"}</Link></Table.Cell>
                                <Table.Cell><Link to={`./view-tournament?code=${tournament.code}`}>{isTournamentFinished(tournament)?"yes":"no"}</Link></Table.Cell>
                                <Table.Cell><Link to={`./view-tournament?code=${tournament.code}`}>{tournament.min_level || 0}</Link></Table.Cell>
                                <Table.Cell><Link to={`./view-tournament?code=${tournament.code}`}>{tournament.comment}</Link></Table.Cell>
                            </Table.Row>
                        ) || null
                    }
                    {
                        loading && <span>loading...</span>|| null
                    }
                </Table.Body>
            </Table>
            <br/>
            {totalPages > 1 &&
            <Pagination
                activePage={Math.ceil((range.start/PAGE_SIZE)+1)}
                totalPages={totalPages}
                firstItem={null}
                lastItem={null}
                onPageChange={(event, pagination)=>{
                    const start = (pagination.activePage-1)*PAGE_SIZE;
                    setRange({
                        start,
                        limit:PAGE_SIZE
                    });
                }}
            /> || null}
        </div>
    </>;
function getAvatar(avatar){
    return <>
        <AvatarFace avatar={avatar} size="medium" inline></AvatarFace>
        <strong style={{display:"block"}}>{avatar?.name}</strong>
    </>;
}
    function isTournamentFinished(tournament){
        if(tournament.expiration_date*1000 < Date.now()){
            return true;
        }
        if(tournament.participants?.length >= tournament.max_participants){
            return true;
        }
        return false;
    }

    function formatSmallDate(num){
        const date = new Date(num*1000);
        return date.toLocaleString();

    }
};