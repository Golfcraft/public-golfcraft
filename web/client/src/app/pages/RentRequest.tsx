import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../AppContext";
import {useAccountContextRedirection, useQuery} from "./pageUtils";
import { resolvePost, resolveFetch } from '../../lib/http';

import {
    BrowserRouter as Router,
    Link,
    useLocation
  } from "react-router-dom";
import { Ad } from "./Market/Ad";
import { getSignatureMessage, SIGN_MESSAGE } from "../../../../common/signatures";
import { Button, Field, Form, Header, Radio, Row, TextArea } from "decentraland-ui";
const useAdData = (adID, account) => {
    const [adData, setAdData] = useState();
    useEffect(()=>{
        (async () => {
            setAdData(await resolveFetch(`api/ad-data?adID=${adID}`, {
                headers:{
                    "access-token": account?.sessionToken
                }
            }))
        })();
    },[]);

    return adData;
}
const Web3 = require('web3');

declare const ethereum;

export const web3 = new Web3(ethereum);
export const RentRequest = () => { 
    const {account} : any = useContext(AppContext);   
    useAccountContextRedirection();
    const urlQuery = useQuery()||{};
    const {adID} = urlQuery;
    const adData = useAdData(adID, account);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [adConditionsAccept, setAdConditionsAccept]:any = useState(false);
    const [contractText, setContractText]:any = useState();
    useEffect(()=>{
        (async() => {
            const contractTextResult = await resolveFetch(`api/ad-contract-text?adID=${adID}`);
            if(!contractTextResult){
                alert("error retrieving contract conditions");
            }
            setContractText(contractTextResult);
            setLoading(false);
        })();
    },[]);

    const onChangeComment = ($event) => {
        if($event.target.value?.length >= 255) return;
        setComment($event.target.value);
    }
 
    const requestRentSignature = async (address, {adID, comment}:any) => {
        const msg = getSignatureMessage(SIGN_MESSAGE.RENT_REQUEST, JSON.stringify({adID, comment}));
        console.log("msg", msg);
        return await ethereum.request({method:"personal_sign", params:[msg, address]});
    };
    const isSubmitDisabled = () => {
        return !adConditionsAccept || loading;
    }
    const submitProposal = async () => {
        if(isSubmitDisabled()) return;
        setLoading(true);
        //TODO sign message
        console.log("adID", adID)
        const signature = await requestRentSignature(account.address, {adID, comment});
        const payload = {adID, comment};
        const data = {            
            address:account.address,
            payload,
            signature
        };
        await resolvePost(`api/rent-request`, data, {"access-token":account.sessionToken}).then(({ok, result})=>{
            alert("Rent request submited");
            location.href = "/my-rentings";
        }, (err)=>{
            setLoading(false);
        });
        //TODO first time making a proposal use should deposit some small amount that will be discounted if a contract goes forward, only first time
        //TODO max requests per account 3 ?
    }
    return <Form>
        <Header size="large">Request to rent LAND</Header>
        {adData && <Ad data={adData} showLink={false} />}
        <br/><br/>
        <Field label="Comment (Purpose or anything you want to communicate to LAND owner)" value={comment} onChange={onChangeComment} />

        <Row>
            {contractText && <TextArea style={{width:"100%", height:"400px"}} value={contractText.text} readOnly={true}></TextArea> || null}
        </Row>
        <br/><br/>
        <Row>
         <Radio toggle label="I accept contract conditions"  checked={adConditionsAccept} onChange={(event)=>setAdConditionsAccept(!adConditionsAccept)} />
        </Row>
        <br/><br/>
        <Row>
            <Button disabled={isSubmitDisabled()} primary onClick={submitProposal}>Submit Request</Button>
        </Row>        
    </Form>
}