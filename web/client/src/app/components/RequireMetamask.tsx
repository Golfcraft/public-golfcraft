import React, {useContext} from "react";
import {AppContext} from "../AppContext";
import {Button} from "decentraland-ui";

export const RequireWeb3Wallet = ({children}) => {
    const context = useContext(AppContext);
    const {selectedAddress, hasMetamask} = context.contextState;

    const connectMetamaskAccount = async ()=>{
       context.connect();
    }

    return hasMetamask
        ? (selectedAddress) ? <>{children}</> : <Button onClick={()=>connectMetamaskAccount()} style={{cursor:"pointer"}}>Connect metamask account</Button>
        : <p>Metamask wallet extension is required: <a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=es">Metamask Chrome extension</a> </p>
}