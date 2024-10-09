import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../AppContext";
import { resolveFetch } from "../../../lib/http";
import {TenantRentings} from './TenantRentings';
import {OwnerRentings} from "./OwnerRentings";
import { Empty, Header, Tabs } from "decentraland-ui";

declare const ethereum;

export const MyRentings = () => {
    const {account} : any = useContext(AppContext);   
    const [data, setData]:any = useState();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("");
    
    const fetchData = () => {
        return resolveFetch(`api/my-rentings?address=${account.address}`, {
            headers:{
                "access-token": account?.sessionToken
            }
        }).then((data)=>{
            setData(data);
            return data;
        })
    }
    
    useEffect(()=>{
        fetchData().then((data)=>{
            console.log("data",data);
            if(data?.rentRequests?.length){
                setActiveTab("tenant");
            }else if(data?.ownerRequests?.length){
                setActiveTab("owner");
            }
        }).finally(()=>setLoading(false));
    }, []);

    const onOwnerRentingsAction = () => {
        fetchData().finally(()=>setLoading(false));
    }
  
    return <>
        <Header size="large">My rentings</Header>
        <Tabs>
            <Tabs.Tab active={activeTab === "tenant"} onClick={()=>setActiveTab("tenant")}>As tenant</Tabs.Tab> 
            <Tabs.Tab active={activeTab === "owner"} onClick={()=>setActiveTab("owner")}>As owner</Tabs.Tab> 
        </Tabs>
        
        {activeTab === "tenant" && <TenantRentings data={data}></TenantRentings> || null}
        {activeTab === "owner" && <OwnerRentings data={data} onAction={()=>onOwnerRentingsAction()}></OwnerRentings> || null}  
                    </>;
}