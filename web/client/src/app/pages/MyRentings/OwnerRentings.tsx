import React, { useContext, useState } from "react";

import {RENT_REQUESTS} from "../../../../../common/status";
import { Button, Empty, Header, Segment, Table } from "decentraland-ui";
import { getLandImageURL, isParcel } from "../../../lib/landUtils";
import { AppContext } from "../../AppContext";
import { resolvePost } from "../../../lib/http";
import { getSignatureMessage, SIGN_MESSAGE } from "../../../../../common/signatures";

import { encodeTokenId, isUpdateAuthorized, setUpdateOperator } from "../../services/metamask";

declare const ethereum;

export const OwnerRentings = ({data, onAction}) => {
    const {account} : any = useContext(AppContext);   
    const [loading, setLoading] = useState(false);

    const askRentRequestSignature = async (address, {rentRequestID}:any) => {
        const msg = getSignatureMessage(SIGN_MESSAGE.ACCEPT_RENT_REQUEST, rentRequestID);
        return await ethereum.request({method:"personal_sign", params:[msg, address]});
    };

    const acceptRentRequest = async (rentRequestID) => {   
        if(loading) return;     
        setLoading(true);
        //TODO request sign message 
        //TODO submit data
        console.log("acceptRentRequest",rentRequestID)
        
        let signature
        try{
            signature = await askRentRequestSignature(account.address, {rentRequestID});
        }catch(error){
            setLoading(false);
            return;
        }
        console.log("signature", signature)
        const payload = {rentRequestID};
        const data = {
            address:account.address,
            payload,
            signature
        };
        console.log("signature", signature)
        await resolvePost(`api/accept-rent-request`, data, {
            "access-token": account?.sessionToken
        }).then((data)=>{
            alert(`Rent request accepted`);
            location.reload();
           //TODO onAction fetchData().finally(()=>setLoading(false));            
        });
    };

    const declineRentRequest = (rentRequestID) => {

    };

    const getButtonModifierClass = (modifiers?:string[]) => {
        return (modifiers||[]).map(modifier => `Form-Field-Button--${modifier}`).join(' ');
    }

    const filterAcceptedAdRequests = (rentRequests) => {
        const acceptedAdIDs = rentRequests.reduce((acc, rentRequest)=>{
            if(rentRequest.status === "ACCEPTED"){
                acc.push(rentRequest.adID);
            }
            return acc;
        },[]);
        return rentRequests.filter(rentRequest => !~acceptedAdIDs.indexOf(rentRequest.adID) || rentRequest.status === "ACCEPTED" )
    };

    const giveDeployPermission = async (entityID, clientAddress) => {              
        const tokenId = await encodeTokenId(entityID);
        console.log("TOKEN_ID",tokenId);
        //TODO ask if the clientAddress already have permission, if does, alert and refresh page
        const clientHasPermission = await isUpdateAuthorized(entityID, clientAddress);
        console.log("clientHasPermission", clientHasPermission, typeof clientHasPermission);
        if(clientHasPermission === "true"){
            alert("Client address already has permission");
            location.reload();
        }

        await setUpdateOperator(account, entityID, clientAddress);        
    }

    return <>
     {(data?.ownerRequests?.length || data?.ownerContracts?.length) && 
        <>
            {data?.ownerRequests?.length && 
            <Segment>
                <Header>Requests for renting</Header>    
                <Table basic="very">
                    <Table.Header><Table.Row>
                        <Table.HeaderCell>ID</Table.HeaderCell>
                        <Table.HeaderCell>Thumbnail</Table.HeaderCell>
                        <Table.HeaderCell>Created</Table.HeaderCell>
                        <Table.HeaderCell>Client</Table.HeaderCell>
                        <Table.HeaderCell>Comment</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        <Table.HeaderCell>Price</Table.HeaderCell>
                        <Table.HeaderCell>Actions</Table.HeaderCell>
                    </Table.Row></Table.Header>
                    <Table.Body>
                    {filterAcceptedAdRequests(data.ownerRequests).map(({ID, adID, comment, status, entityID, priceEth, entityOwner, creationDate, modificationDate, clientAddress})=>{
                        const x = isParcel(entityID)?entityID.split(',')[0]:undefined;
                        const y = isParcel(entityID)?entityID.split(',')[1]:undefined;
                        return <Table.Row key={ID}>
                            <Table.Cell>{entityID}</Table.Cell>
                            <Table.Cell><img width={50} src={getLandImageURL({id:entityID, x, y}, {width:100, height:100})} /></Table.Cell>
                            <Table.Cell>{new Date(creationDate).toLocaleDateString()}</Table.Cell>
                            <Table.Cell>{clientAddress}</Table.Cell>
                            <Table.Cell>{comment}</Table.Cell>
                            <Table.Cell>{status}</Table.Cell>
                            <Table.Cell>{priceEth/1000000000000000000} Eth</Table.Cell>
                            <Table.Cell>
                                <div>
                                    {status === 'OPEN' && <Button size="small" primary className={`Form-Field-Button ${getButtonModifierClass([loading?'disabled':'enabled', 'danger'])}`} onClick={()=>acceptRentRequest(ID)}>Accept</Button>}
                                </div>
                            {
                                status === RENT_REQUESTS.WAITING_OPERATOR && entityOwner === account.address 
                                && <Button size="small" primary onClick={()=>giveDeployPermission(entityID, clientAddress)}>Give deploy permission</Button>
                                || null
                            }                            
                            </Table.Cell>
                        </Table.Row>;
                    })}
                    </Table.Body>
                </Table>
            </Segment>}
        </>}  
        {!data?.ownerRequests?.length && <Empty>No results...</Empty> || null}  
    </>
}