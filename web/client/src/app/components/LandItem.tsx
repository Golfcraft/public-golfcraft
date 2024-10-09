import React, { useState, useEffect, useContext } from "react";
import {getLandImageURL, isParcel} from '../../lib/landUtils';
import {ADS} from "../../../../common/status";

import {
    BrowserRouter as Router,
    Link,
    useLocation
  } from "react-router-dom";

import { getSignatureMessage, SIGN_MESSAGE } from "../../../../common/signatures";
import { AppContext } from "../AppContext";
import { resolvePost } from "../../lib/http";
import { Card } from "decentraland-ui";
declare const ethereum;
const askDeleteAdSignature = async (address, {adID, entityID}) => {
    return await ethereum.request({method:"personal_sign", params:[getSignatureMessage(SIGN_MESSAGE.DELETE_AD, JSON.stringify({adID, entityID})), address]});
};

export const LandItem = ({land, links=[], onDelete}:{land:any, links?:any[], onDelete?:any}) => {
    const {account}:any = useContext(AppContext);
    
    const deleteAd = async () => {
        //TODO request signature
        //TODO send DELETE
        const signature = await askDeleteAdSignature(account.address, {adID:land.ad.ID, entityID:land.ad.entityID});
        const payload = {adID:land.ad.ID, entityID:land.ad.entityID};
        const data = {
            address:account.address,
            payload,
            signature
        };
        await resolvePost(`api/delete-ad`, data, {
            "access-token": account?.sessionToken
        }).then((data)=>{
            if(onDelete) {
                onDelete();
            }
           // fetchData().finally(()=>setLoading(false));            
        });
    }
    return <div className={`LandList-item`}>{/* JSON.stringify(land, null, '  ') */}
    <Card style={{width:'152px'}}>
    <img src={getLandImageURL(land)} />
    <div className={'LandList-item-coords'}>{land.id}</div>
    {links.map((link:{text:string, url:string, type:string})=>{
        let className =  `LandList-item-action`;
        if(link.type) className += ` LandList-item-action--${link.type}`
        return <Link key={link.url} className={className} to={link.url}>
            {link.text}
        </Link>
    })}
    {
        land.ad && land.ad.status === ADS.PENDING && <div className={`LandList-item-action LandList-item-action--waitingVerification`}>Waiting verification</div>
    }
    {
        land.ad && land.ad.status === ADS.ACTIVE && <div onClick={()=>deleteAd()} className={`LandList-item-action LandList-item-action--danger`}>Delete Ad</div>
    }
   {
        land.ad && land.ad.status === ADS.CONTRACT_RUNNING && <Link to="/my-rentings" className={`LandList-item-action LandList-item-action--blue`}>Contract</Link>
    }
    </Card>
    </div>
}