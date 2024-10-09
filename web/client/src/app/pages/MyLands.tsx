import React, { useState, useEffect, useContext } from "react";
import {
    BrowserRouter as Router,
    Link,
    useLocation
  } from "react-router-dom";
import "./MyLand.scss"
import { AppContext } from "../AppContext";
import { resolvePost, resolveFetch } from '../../lib/http';
import {LandItem} from "../components/LandItem";
import {useAccountContextRedirection} from "./pageUtils";
import {ADS} from "../../../../common/status";
import { Header } from "decentraland-ui";

const marketApi = `https://api.decentraland.org/v1`;
export const MyLands = React.memo(() => {
    const [myParcels, setMyParcels] = useState([]);
    const [myEstates, setMyEstates] = useState([]);
    const [loading, setLoading] = useState(true);
    const {account}:any = useContext(AppContext);
    useAccountContextRedirection();
    useEffect(()=>{
        (async() => {
         
            const {parcels, estates} = await resolveFetch(`api/my-lands?address=${account.address}`, {
                headers:{
                    "access-token": account.sessionToken
                }
            });//TODO handling session failed
            setLoading(false);
            setMyEstates(estates);
            setMyParcels(parcels);
        })();

        return () => {};
    }, []);

    const getLandActions = (land) => {
        if(land?.ad?.status === ADS.CONTRACT_RUNNING){
            return []
        }
        if(land?.ad?.status === ADS.PENDING){
            return []
        }
        if(land?.ad?.status === ADS.ACTIVE){
            return [ ]
        }
        if(land?.ad?.status === ADS.ACCEPTED_REQUEST){
            return [
                {text: 'Accepted', url:'/my-rentings', type:'green'}
             ]
        }
        if(land?.ad?.status === ADS.PAID){
            return [
                {text: 'Waiting permission', url:'/my-rentings', type:'green'}
             ]
        }
        return [
            {text:`Create ad`, url:`/create-ad?id=${land.id}`}
        ]
    }
    const refresh = () => window.location.reload();
    return <div>
       
        {loading && `Loading...`}
        {!loading && 
        <>
            {myEstates?.length && <>
                <Header>My estates</Header>
                <div className={`LandList`}>
                    {
                    myEstates.map((land:any)=><LandItem key={land.id} land={land} links={getLandActions(land)} onDelete={refresh} /> )
                    }
                </div>
            </> || null}
            {myParcels?.length && <>
                <Header>My parcels</Header>
            <div className={`LandList`}>
                {
                    myParcels.map((land:any)=><LandItem key={land.id} land={land} links={getLandActions(land)} onDelete={refresh} /> )
                }
            </div>
            </>|| null}
            
            {(!myEstates?.length && !myParcels?.length) && <div>Yo don't have LAND, go to <Link to="/market">market</Link> to rent one.</div> || null }            
        </>}        
    </div>;
})