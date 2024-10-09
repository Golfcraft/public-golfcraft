import React, {useState, useEffect, useContext} from "react";
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
import {AppContext} from "../AppContext";
import {serializeRecipe} from "../../../../../common/utils";
import {useQuery} from "./pageUtils";

const PAGE_SIZE = 10;
const avatars = getAvatars();
export const MyCourses = () => {
    const {address} = useQuery()||{};
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [,setAvatars] = useLocalStorage("avatars", {});
    const {contextState}:any = useContext(AppContext);
    const {selectedAddress} = contextState;

    useEffect(()=>{
        (async() => {
            setLoading(true);
            const courses = (await resolvePost(`/api/prisma-find-many/courses`,
                {"where":{
                    "NOT":[{"tokenId":null}, {"tokenId":0}],
                        "createdBy":(address||selectedAddress).toLowerCase()
                    },
                }
            )).sort((a,b)=>(b.evaluation||0)-(a.evaluation||0));
            console.log(courses)
            setCourses(courses);
            const organizerAddresses:string[] = Array.from(new Set(courses.map(t=>t.createdBy)));

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
        <Header size="large">{address?`Golf courses from ${address}`:"My golf courses"}</Header>
        <div>
            {
                loading && <span>loading...</span>|| null
            }
            <Table padded={true} basic="very" size="small" style={{width:'100%', textAlign:'center', margin:0}}>
                <Table.Header>
                    <Table.HeaderCell>Alias</Table.HeaderCell>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Evaluation</Table.HeaderCell>
                    <Table.HeaderCell>Times played</Table.HeaderCell>
                    <Table.HeaderCell>Av. Time to complete</Table.HeaderCell>
                    <Table.HeaderCell>Generated Rewards</Table.HeaderCell>
                </Table.Header>
                <Table.Body style={{height:100}}>
                    {
                        !courses?.length && <tr><td colSpan={3}>Empty</td></tr> || ""
                    }
                    {
                        !loading && courses?.map((course, index)=>
                            <Table.Row key={course.ID}>
                                <Table.Cell>{course.alias}</Table.Cell>
                                <Table.Cell>{course.displayName}</Table.Cell>
                                <Table.Cell>{course.evaluation}</Table.Cell>
                                <Table.Cell>{course.timesPlayed}</Table.Cell>
                                <Table.Cell>{course.averageTime}</Table.Cell>
                                <Table.Cell>{serializeRecipe(JSON.parse(course.rewards))}</Table.Cell>
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