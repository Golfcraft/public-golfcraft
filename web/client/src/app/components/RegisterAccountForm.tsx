import { Button, Field, Form, Header, Hero } from "decentraland-ui";
import React from "react";
import {useState} from "react";
import {getSignatureMessage, SIGN_MESSAGE} from '../../../../common/signatures';

const headers = {
    'Content-Type': 'application/json'
};
declare const ethereum;
export const RegisterAccountForm = ({address, registered, onRegistered}) => {
   const [email, setEmail] = useState(""); 
   const [emailVerificationCode, setEmailVerificationCode] = useState("");
   const [waitingCode, setWaitingCode] = useState(false);
   const [loading, setLoading] = useState(false);


   const emailChange = (event) => setEmail(event.target.value);
   const requestEmailSignature = async () => {
    return await ethereum.request({method:"personal_sign", params:[getSignatureMessage(SIGN_MESSAGE.REGISTER_EMAIL, email), address]});
   };

   const isSubmitEmailValid = () => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
   };

   const onClickSubmit = async () => {
       if(loading) return;
       if(!email) return;
       setLoading(true);
       const signature = await requestEmailSignature();
        let registerResult;
        //TODO send data to bakend
        registerResult = fetch(`api/register-account`, {
            method:'POST',
            headers,
            body:JSON.stringify({
                address,
                signature,
                email
            })
        }).then((result)=>result.status >= 200 && result.status < 300 ? result.json() : result.json().then(j=>Promise.reject(j)))
        .then((json)=>{
            setWaitingCode(true);
        },(error)=>{
            alert(error.message);
        }).finally(()=>{
            setLoading(false);
        })
       //onRegistered(registerResult);
   };

   const submitVerificationCode = ({emailVerificationCode}) => {
       if(loading) return;
       if(!emailVerificationCode) return;
       setLoading(true);
        fetch(`api/verify-email-code`, {
            method:'POST',
            headers,
            body:JSON.stringify({
                email:email.trim(),
                address,
                emailVerificationCode
            })
        }).then((result)=>result.status >= 200 && result.status < 300 ? result.json() : result.json().then(j=>Promise.reject(j)))
        .then((json)=>{
            onRegistered(json); //TODO we should receive a JWT
        },(error)=>{
            alert(error.message)
        }).finally(()=>{
            setLoading(false);
        })
   };

   return <>
        {(waitingCode || registered) && <Hero centered>
            <Hero.Header>🔑 Register account</Hero.Header>
            <Hero.Description>
                Verify email
                <Form>
                    <Field placeholder="Enter code sent to your mail" value={emailVerificationCode} onChange={(event)=>setEmailVerificationCode(event.target.value)}  />
                </Form>
            </Hero.Description>
            <Hero.Actions>
                <Button primary disabled={loading} onClick={() => submitVerificationCode({emailVerificationCode})}>
                 Submit
                </Button>  
            </Hero.Actions>
        </Hero> || null}
        {!waitingCode && !registered && <Hero centered>
            <Hero.Header>🔑 Register account</Hero.Header>
            <Hero.Description>
                Register your account to start publishing or renting on the market.
                <Form>
                    <Field className={`Register-Email`} 
                    placeholder="Email"
                        label="Email" 
                        type="email" 
                        id="email" 
                        name="email" 
                        value={email} 
                        onChange={emailChange} />                     
                </Form>
            </Hero.Description>
           
            <Hero.Actions>
                <div>You accept <a target="_blank" href="https://dclrenting.com/policy.txt">Policy privacy</a> by signing up&nbsp;</div>
                <Button primary disabled={loading || !isSubmitEmailValid()} onClick={() => onClickSubmit()}>
                    Sign up
                </Button>  
            </Hero.Actions>
           
        </Hero> || null}
   </>;
}