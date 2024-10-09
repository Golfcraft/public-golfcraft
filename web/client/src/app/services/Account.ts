import { getSignatureMessage, SIGN_MESSAGE } from "../../../../common/signatures";
import { resolveFetch, resolvePost } from "../../lib/http";

declare const ethereum;

type AddressConnectionState = {
    loginNonce?:number,
    registered?:boolean,
    emailVerified?:boolean,
    sessionToken?:string
};


export const fetchToken = async ({loginNonce, address}) => {
    const msgToSign = getSignatureMessage(SIGN_MESSAGE.LOGIN_NONCE, loginNonce);
    const signature = await ethereum.request({method:"personal_sign", params:[msgToSign, address]});
    const {token} = await resolvePost(`api/login`, { address, signature });
    
    return {token};
};

export const getAddressRegistationState = async ({address}):Promise<AddressConnectionState> => {    
    const sessionToken = sessionStorage.getItem(`token_${address}`);
    if(sessionToken) return {registered:true, emailVerified:true, sessionToken};

    try {
        var {loginNonce, emailVerified} = await resolveFetch(`api/request-login-nonce?address=${address}`);
        var registered = true;

    }catch(error){   
        console.log("request-login-nonce error", error)     
        //TODO
        return ({registered:false});
    }
    if(!emailVerified) return {registered:true, emailVerified}; 
    
    //if emailVerified and registered and loginNonce
    if(emailVerified && registered){
        const {token} = await fetchToken({loginNonce, address});
        if(token) {
            sessionStorage.setItem(`token_${address}`, token);
            return {emailVerified, registered, loginNonce, sessionToken:token}
        }else{
            alert("Error ??");
        }

    }
}