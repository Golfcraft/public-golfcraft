import React, { useState, useContext, useEffect } from "react";
import {resolveFetch, resolvePost} from '../../lib/http';
import { AppContext } from "../AppContext";
import {
    BrowserRouter as Router,
    Link,
    useLocation
  } from "react-router-dom";
import { LandItem } from "../components/LandItem";
import "./CreateAd.scss";
import { isParcel } from "../../lib/landUtils";
import { getSignatureMessage, SIGN_MESSAGE } from "../../../../common/signatures";
import { useQuery } from "./pageUtils";
import { Button, Field, Form, Header, Radio, Row, TextArea } from "decentraland-ui";
declare const ethereum: any;
declare const web3: any;

const requestEditAdSignature = async (address, {adID, entityID, priceEth, months, contractText}) => {
  return await ethereum.request({method:"personal_sign", params:[getSignatureMessage(SIGN_MESSAGE.UPDATE_AD, JSON.stringify({adID, entityID, priceEth, months, contractText})), address]});
};


export const EditAd = () => {
    const {account}:any = useContext(AppContext);
    const urlQuery = useQuery()||{};
    const {adID} = urlQuery;
    const [entityID, setEntityID] = useState();
    const [adTitle, setAdTitle] = useState("");
    const [adDescription, setAdDescription] = useState("");
    const [adMonths, setAdMonths] = useState();
    const [adEthPrice, setEthPrice] = useState();
    const [adConditionsAccept, setAdConditionsAccept]:any = useState(false);
    const [contractText, setContractText]:any = useState();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(()=>{
      (async() => {
          const contractTextResult = await resolveFetch(`api/contract-text`);
          if(!contractTextResult){
              alert("error retrieving contract conditions");
              return;
          }
          const adData = await resolveFetch(`api/ad-data?adID=${adID}`,{
            headers:{
                "access-token": account.sessionToken
            }
          })
          if(!adData){
            alert("failed to fetch ad data");
            return;
          }
          setAdTitle(adData.title);
          setAdDescription(adData.description);
          setAdMonths(adData.months);
          setEthPrice(web3.fromWei(adData.priceEth));
          setEntityID(adData.entityID);

          setContractText(contractTextResult);
          setIsLoading(false);
      })();
  },[]);
  
  const submit = async () => {
        if(isSubmitDisabled()) return;
        if(isLoading) return;
        if(!((adEthPrice || 0) >= 0.03)) {
            alert("ETH price should be equal or bigger than 0.03");
            return;
        }
        setIsLoading(true);
        const dataToSubmit = {
            title:adTitle,
            description:adDescription,
            priceEth:adEthPrice,
            months:adMonths,   
            adID: adID,
            entityID:entityID,            
            entityType:entityID && (~entityID.indexOf(`,`)?`parcel`:`estate`) || undefined,
            contractText
        };
        //TODO !IMPORTANT add validation
        if(!dataToSubmit.priceEth || !dataToSubmit.months) {
            alert("Price and months must be defined");
            return;
        }
        
        let signature;
        try {
            signature = await requestEditAdSignature(account.address, {adID, entityID, priceEth:adEthPrice, months:adMonths, contractText});
        }catch(err){
            setIsLoading(false);
            return Promise.reject({message:"SIGNING_ERROR"});
        }        

        if(!signature){
            setIsLoading(false);
            return Promise.reject({message:"SIGNING_ERROR"});
        }

        await resolvePost(`api/update-ad`, {payload:{...dataToSubmit}, signature, address:account.address}, {
            "access-token":account.sessionToken
        }).then(({ok, result})=>{
            alert("Ad update success");
            //TODO redirect to my-land
            location.href = "/market";
        }, (err) => {
            alert("error updating: "+err.message);
        });
  }

  const getCoordsFromLandId = (id) => {
    if(!id) return;
    const s = id.split(`,`);
    return {x:s[0], y:s[1]};
  }  

  const handleAdTitle = (event) => {
      if(event.target.value?.length > 30) return;
      setAdTitle(event.target.value);
  }

  const handleAdDescription = (event) => {
      if(event.target.value?.length > 255) return;
      setAdDescription(event.target.value);
  }

  const handleAdMonths = (event) => {
      if(Number(event.target.value) > 12 || Number(event.target.value) < 2) return;
      setAdMonths(Number(event.target.value));
  }

  const handleEthPrice = (event) => {
      if(Number(event.target.value) < 0) return;
      setEthPrice(Number(event.target.value));
  }

  const isSubmitDisabled = () => {
      return isLoading || adConditionsAccept === false;
  }

  return <Form>
        <Header size="large">Create renting ad for land {entityID}</Header>
        {entityID && <LandItem land={{id:entityID, ad:{ entityID, id:adID } , ...getCoordsFromLandId(entityID)}} />}
        <br/>
        <br/>
        <Field label="Title (30)" value={adTitle} onChange={(event)=>handleAdTitle(event)} />
        <Field label="Description (255)" value={adDescription} onChange={(event) => handleAdDescription(event)} />
        <Field type="number" label="Warranty months (2-12)" value={adMonths} onChange={(event)=>handleAdMonths(event)} />
        <Field type="number" step="0.01" label="Eth price per month (0.03)" value={adEthPrice} onChange={(event)=>handleEthPrice(event)} />
        <Row>
            {contractText && <TextArea style={{width:"100%", height:"400px"}} value={contractText.text} readOnly={true}></TextArea> || null}
        </Row>
        <br/><br/>
        <Row>
        <Radio toggle label="I accept contract conditions"  checked={adConditionsAccept} onChange={(event)=>setAdConditionsAccept(!adConditionsAccept)} />
        </Row>
        <br/><br/>
        <Row>
            <Button disabled={isSubmitDisabled()} primary onClick={submit}>Submit</Button>
        </Row>
    </Form>
};