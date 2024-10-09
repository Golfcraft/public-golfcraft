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
export const BuilderContest = () => {
    const [loading, setLoading] = useState(true);
    const [leaderboard, setLeaderboard] = useState([]);
    const [creatorLeaderboard, setCreatorLeaderboard] = useState([]);
    const [,setAvatars] = useLocalStorage("avatars", {});

    useEffect(()=>{
        (async() => {
            setLoading(true);
            const leaderboard = (await resolvePost(`/api/prisma-find-many/courses`,
                {"where":{"NOT":[{"tokenId":null}, {"tokenId":0}]}}
            )).sort((a,b)=>(b.evaluation||0)-(a.evaluation||0)).filter(c=>c.createdBy!=="0x598f8af1565003ae7456dac280a18ee826df7a2c");
            console.log(leaderboard);
            setCreatorLeaderboard(leaderboard.reduce((acc, current)=>{
                console.log("acc",acc)
                const {createdBy, evaluation} = current;
                const foundCreator = acc.find(i=>i.address===createdBy);
                if(foundCreator){
                    foundCreator.score += evaluation;
                }else{
                    acc.push({
                        address:createdBy,
                        score:evaluation
                    })
                }
                return acc;
            },[]).sort((a,b)=>(b.score||0)-(a.score||0)).filter(c=>c.createdBy!=="0x598f8af1565003ae7456dac280a18ee826df7a2c"))
            setLeaderboard(leaderboard);
            const organizerAddresses:string[] = Array.from(new Set(leaderboard.map(t=>t.createdBy)));

            let i = organizerAddresses.length;
            while(i--){
                if(!avatars[organizerAddresses[i]]){
                    const profile = await resolveFetch(`https://peer-lb.decentraland.org/lambdas/profiles?id=${organizerAddresses[i]}`);
                    avatars[organizerAddresses[i]] = profile[0].avatars[0];
                }
            }
            setAvatars(avatars);
            setLoading(false);
        })();
    },[]);

    return <>

        <Header size="large">Builder contest leaderboard</Header>
        {
            loading && <span>loading...</span>|| null
        }
        <Header.Subheader>By Creator</Header.Subheader>
        <div>
            <Table padded={true} basic="very" size="small" style={{width:'100%', textAlign:'center', margin:0}}>
                <Table.Header>
                    <Table.HeaderCell>Position</Table.HeaderCell>
                    <Table.HeaderCell>Creator</Table.HeaderCell>
                    <Table.HeaderCell>Score</Table.HeaderCell>
                </Table.Header>
                <Table.Body style={{height:100}}>
                    {
                        !creatorLeaderboard?.length && <tr><td colSpan={3}>Empty</td></tr> || ""
                    }
                    {
                        !loading && creatorLeaderboard?.map((creator:any, index)=>
                            <Table.Row key={creator.address}>
                                <Table.Cell>{index+1}</Table.Cell>
                                <Table.Cell>{avatars && getAvatar(avatars[creator.address]) || null}</Table.Cell>
                                <Table.Cell>{creator.score}</Table.Cell>
                            </Table.Row>
                        ) || null
                    }

                </Table.Body>
            </Table>
        </div>
        <br/><br/>
        <Header.Subheader>By Maps</Header.Subheader>

        <div>
            <Table padded={true} basic="very" size="small" style={{width:'100%', textAlign:'center', margin:0}}>
                <Table.Header>
                    <Table.HeaderCell>Position</Table.HeaderCell>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Creator</Table.HeaderCell>
                    <Table.HeaderCell>Score</Table.HeaderCell>
                </Table.Header>
                <Table.Body style={{height:100}}>
                    {
                        !leaderboard?.length && <tr><td colSpan={3}>Empty</td></tr> || ""
                    }
                    {
                        !loading && leaderboard?.map((course, index)=>
                            <Table.Row key={course.ID}>
                                <Table.Cell><Link to={`./view-course?code=${course.ID}`}>{index+1}</Link></Table.Cell>
                                <Table.Cell>{course.displayName || course.alias}</Table.Cell>
                               <Table.Cell>{avatars && getAvatar(avatars[course.createdBy]) || null}</Table.Cell>
                                <Table.Cell>{course.evaluation}</Table.Cell>
                            </Table.Row>
                        ) || null
                    }

                </Table.Body>
            </Table>
        </div>
    </>;
    function getAvatar(avatar){
        return <>
            <AvatarFace avatar={avatar} size="medium" inline></AvatarFace>
            <strong style={{display:"block"}}>{avatar?.name}</strong>
        </>;
    }
};