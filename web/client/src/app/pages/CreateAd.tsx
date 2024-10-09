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
import { useQuery, requestPayment} from "./pageUtils";
import { Button, Field, Message, Form, Header, Radio, Row, TextArea } from "decentraland-ui";
const Web3 = require('web3');
declare const ethereum;
export const web3 = new Web3(ethereum);
//TODO add maxLength
const STATUS = {
    IDLE:"IDLE",
    SENDING:"SENDING"
};

const requestCreateAdSignature = async (address, {id, priceEth, months, contractText}) => {
    return await ethereum.request({method:"personal_sign", params:[getSignatureMessage(SIGN_MESSAGE.CREATE_AD, JSON.stringify({id, priceEth, months, contractText:contractText})), address]});
};

export const CreateAd = () => {
    const {account}:any = useContext(AppContext);
    const urlQuery = useQuery()||{};
    const {id} = urlQuery;
    const [adTitle, setAdTitle] = useState("");
    const [adDescription, setAdDescription] = useState("");
    const [adMonths, setAdMonths] = useState(2);
    const [adConditionsAccept, setAdConditionsAccept]:any = useState(false);
    const [adEthPrice, setEthPrice] = useState(0.05);
    const [adRequestStatus, setAdRequestStatus] = useState(STATUS.SENDING);
    const [validationErrors, setValidationErrorrs] = useState([] as string[]);
    const [contractText, setContractText]:any = useState();

    useEffect(()=>{
        (async() => {
            const contractTextResult = await resolveFetch(`api/contract-text`);
            if(!contractTextResult){
                alert("error retrieving contract conditions");
                return;
            }
            setContractText(contractTextResult);
            setAdRequestStatus(STATUS.IDLE);
        })();
    },[])
    const submit = async () => {
        if(isSubmitDisabled()) return;
        if(adRequestStatus !== STATUS.IDLE) return;
        if(!(adEthPrice >= 0.03)) {
            alert("ETH price should be equal or bigger than 0.03");
            return;
        }
        setAdRequestStatus(STATUS.SENDING);
        const dataToSubmit = {
            title:adTitle,
            description:adDescription,
            priceEth:adEthPrice,
            months:adMonths,   
            entityID:id,
            entityOwner:account.address,         
            entityType:~id.indexOf(`,`)?`parcel`:`estate`,
            contractText
        }
        //TODO !IMPORTANT add validation
        if(!dataToSubmit.priceEth || !dataToSubmit.months) {
            setValidationErrorrs(["Price and months must be defined"]);
            return;
        }
        setAdRequestStatus(STATUS.SENDING);

        let signature;
        try {
            signature = await requestCreateAdSignature(account.address, {id, priceEth:adEthPrice, months:adMonths, contractText});
        }catch(err){
            setAdRequestStatus(STATUS.IDLE);
            return Promise.reject({message:"SIGNING_ERROR"});
        }
        

        if(!signature){
            setAdRequestStatus(STATUS.IDLE);
            return Promise.reject({message:"SIGNING_ERROR"});
        }
        let tx;
        try {
            tx = await requestPayment(account.address, 0.004);

        } catch(error) {
            setAdRequestStatus(STATUS.IDLE);
            return Promise.reject({message:"PAYMENT_ERROR"});
        }
        
        if(!tx){
            return Promise.reject({message:"PAYMENT_ERROR"});
        }
        await resolvePost(`api/create-ad`, {payload:{...dataToSubmit, paymentTx:tx}, signature, address:account.address}, {
            "access-token":account.sessionToken
        }).then(({ok, result})=>{
            alert("Ad creation requested, waiting for verification of requirements");
            //TODO redirect to my-land
            location.href = "/my-lands";
        }, (err) => {
            alert("error when insert");
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
        return adRequestStatus === STATUS.SENDING || adConditionsAccept === false;
    }

    const showAdContractConditions = (event) => {
        event.preventDefault();
    }

    return <Form>
        <Message
      warning
      visible
      content={'We are releasing a new version to improve the scalability of the platform, meanwhile ad creation is disabled. Our sincere apologies.'}
      header={'Ad creation disabled'}
    />

       {/*  <Header size="large">Create renting ad for land {id}</Header>
        <LandItem land={{id, ...getCoordsFromLandId(id)}} />
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
            <Button disabled={isSubmitDisabled()} primary onClick={submit}>Submit (0.004Ξ)</Button>
        </Row> */}
    </Form>
};