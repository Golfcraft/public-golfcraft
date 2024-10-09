import React, { useState, useEffect, useContext } from "react";
import { resolvePost, resolveFetch } from '../../lib/http';
import {Ad} from "./Market/Ad";
import { AppContext } from "../AppContext";
import { Card, Header } from "decentraland-ui";

const useOpenAds = (initialValue, address) => {
    const [ads, setAds] = useState(initialValue);
 
    useEffect(()=>{
        (async() => {
            setAds(await resolveFetch(`api/open-ads?address=${address||''}`));
        })();
    },[]);
    return ads;
}

export const Market = () => {
    const appContext:any = useContext(AppContext);
    const {address, registered, emailVerified} = appContext.account||{};
    const ads:any = useOpenAds([], address);

    return <>
        <Header size="large">🛒 Renting market</Header>
        <Card.Group>
        {
            (ads||[]).map(ad => {
            return <Ad key={ad.ID} data={ad} 
                showLink={address && registered && emailVerified && !ad.requestedRent && address !== ad.entityOwner} 
                showEdit={address && registered && emailVerified && !ad.requestedRent && address === ad.entityOwner}
                showMyRentings={ad.requestedRent}></Ad>
            })
        }
        </Card.Group>
    </>;
  
}