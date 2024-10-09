import React, { useContext, useState } from "react";

import {RENT_REQUESTS} from "../../../../../common/status";
import { Button, Empty, Header, Segment, Table } from "decentraland-ui";
import { getLandImageURL, isParcel } from "../../../lib/landUtils";
import { AppContext } from "../../AppContext";
import { requestPayment } from "../pageUtils";
import { resolveFetch, resolvePost } from "../../../lib/http";
import { getSignatureMessage, SIGN_MESSAGE } from "../../../../../common/signatures";
import {web3} from "../../services/metamask";
declare const ethereum;

const getButtonModifierClass = (modifiers?:string[]) => {
    return (modifiers||[]).map(modifier => `Form-Field-Button--${modifier}`).join(' ');
}

const askDeleteRentRequestSignature = async (address, {rentRequestID}:any) => {
    const msg = getSignatureMessage(SIGN_MESSAGE.DELETE_RENT_REQUEST, rentRequestID);
    return await ethereum.request({method:"personal_sign", params:[msg, address]});
};

export const TenantRentings = ({data}) => {
    const {account} : any = useContext(AppContext);   
    const [loading, setLoading] = useState(false);

    const processPaymentForRent = async ({ID, adID, comment, status, entityID, priceEth, entityOwner}) => {
        if(loading) return;
        setLoading(true);

        const tx = await requestPayment(account.address, web3.utils.fromWei(priceEth.toString())).then(r=>r,()=>undefined);
        
        if(!tx){
            alert("error retrieving transaction");
            setLoading(false);
            return;
        }

        resolvePost(`api/rent-request-payment`, {payload:{rentRequestID:ID, tx}, address:account.address}, {
            "access-token": account?.sessionToken
        }).then(()=>{
            window.location.reload();
        }).finally(()=>{
            setLoading(false);
        });

        //TODO 0 disable other actions on page X
        //TODO 1 ethereum request payment, X
        //TODO 2 send data to backend
        //TODO 3 refresh view
    }

    const deleteRentRequest = async (rentRequestID) => {
        if(loading) return;     
        setLoading(true);
        console.log("deleteRentRequest",rentRequestID);
        let signature
        try{
            signature = await askDeleteRentRequestSignature(account.address, {rentRequestID});
        }catch(error){
            console.error(error);
            setLoading(false);
            return;
        }
        const payload = {rentRequestID};
        const data = {
            address:account.address,
            payload,
            signature
        };
        console.log("signature", signature);
        await resolvePost(`api/delete-rent-request`, data, {
            "access-token": account?.sessionToken
        }).then((data)=>{
            console.log("Rent request deleted", data);
            alert(`Rent request deleted`);
            location.reload();
           //TODO onAction fetchData().finally(()=>setLoading(false));            
        });
    };

    return <>
    {(data?.rentRequests?.length || data?.tenantContracts?.length) && <>
        {data?.rentRequests &&         
            <Segment>
                <Table basic="very">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>ID</Table.HeaderCell>
                            <Table.HeaderCell>Thumbnail</Table.HeaderCell>
                            <Table.HeaderCell>Created</Table.HeaderCell>
                            <Table.HeaderCell>Owner</Table.HeaderCell>
                            <Table.HeaderCell>Comment</Table.HeaderCell>
                            <Table.HeaderCell>Status</Table.HeaderCell>
                            <Table.HeaderCell>Price</Table.HeaderCell>
                            <Table.HeaderCell>Actions</Table.HeaderCell>    
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                    {data.rentRequests.map(({ID, adID, comment, status, entityID, priceEth, entityOwner, paymentTx, creationDate, modificationDate})=>{
                    const x = isParcel(entityID)?entityID.split(',')[0]:undefined;
                    const y = isParcel(entityID)?entityID.split(',')[1]:undefined;
                    console.log("rentRequest ID", ID)
                    return <tr key={ID}>
                        <td>{entityID}</td>
                        <td><img  width={50} src={getLandImageURL({id:entityID, x, y}, {width:100, height:100})} /></td>
                        <td>{new Date(creationDate).toLocaleDateString()}</td>
                        <td>{entityOwner}</td>
                        <td>{comment}</td>
                        <td>{status}</td>
                        <td>{priceEth/1000000000000000000}Ξ</td>
                        <td>
                            {status === RENT_REQUESTS.OPEN && 
                                <Button primary 
                                    className={`${getButtonModifierClass([(loading?'disabled':'enabled'), 'danger'])}`}
                                    onClick={()=>deleteRentRequest(ID)}   
                                >Delete</Button>
                            }
                            {
                                status === RENT_REQUESTS.WAITING_PAYMENT && !paymentTx
                                && <Button primary
                                        onClick={()=>processPaymentForRent({ID, adID, comment, status, entityID, priceEth, entityOwner})} 
                                        className={`${getButtonModifierClass([loading?'disabled':'enabled', 'pay'])}`}>
                                            Pay {web3.utils.fromWei(priceEth.toString())}Ξ</Button> 
                                || null
                            }
                           
                        </td>
                    </tr>;
                })}
                    </Table.Body>
            </Table>
            </Segment>
        }
    </>}
    {!data?.rentRequests?.length && <Empty>No results...</Empty> || null}  
    </>
}