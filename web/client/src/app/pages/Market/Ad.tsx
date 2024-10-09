import { timeStamp } from "console";
import { Button, ButtonGroup, Card, Table } from "decentraland-ui";
import React, { useState, useEffect, useContext } from "react";
import {
    BrowserRouter as Router,
    Link,
    useLocation
  } from "react-router-dom";
import { getLandImageURL, isParcel } from "../../../lib/landUtils";

import "./Ad.scss";
const WEI_ETH = 1000000000000000000;

export const Ad = ({data, showLink = true, showMyRentings = false, showEdit = false}) => {
    const isParcelLand = isParcel({id:data.entityID})
    const x = isParcelLand
                ? data.entityID.split(',')[0]
                : (data.parcels && data.parcels[0]?.x);
    const y = isParcelLand ? data.entityID.split(',')[1] : (data.parcels && data.parcels[0]?.y);
    const urlCoord = isParcelLand ? data.entityID : data.estate && data.estate.parcel.coords;

    return <div className="Ad">
        <Card style={{ margin:'10px'}}>
            <Card.Content>
                <Card.Header style={{marginBottom:'10px'}}>{data.title}</Card.Header>
                <Card.Meta>
                    <div style={{position:'relative'}}>
                        <img src={getLandImageURL({id:data.entityID, x, y }, {width:250,height:100})} />
                        <div className={`LandList-item-coords`}>
                            {(data.estate?.parcel.coords || data.entityID)}
                            { data.estate?.parcels.length && <>&nbsp;&times;{data.estate?.parcels.length}</> }
                        </div>
                    </div>
                                <div >{data.description}</div>    
                                    <Table padded={true} basic="very" size="small" style={{width:'100%', textAlign:'center', margin:0}}>
                                        <Table.Header>
                                            <Table.HeaderCell>Price</Table.HeaderCell>
                                            <Table.HeaderCell className={`WithTooltip`} style={{padding:'0'}}>Warranty 💬
                                                <div className={`Tooltip`}>Tenant can pay first month, and leave afterwards without problems.
<br/><br/>
Duration in rent ad is just to ensure the tenant can have a <b>continuity</b> on his project, if that time is broken by the land owner, tenant will receive <b>25% of paid months as compensation plus the 100%</b> of the current month that has been paid</div>
                                            </Table.HeaderCell>                                         
                                        </Table.Header>
                                        <Table.Row>
                                            <Table.Cell>
                                            {data.priceEth/WEI_ETH}Ξ/mth
                                            </Table.Cell>

                                            <Table.Cell>
                                            25% {data.months} months
                                            </Table.Cell>
                                           
                                        </Table.Row>
                                    </Table>                               
                            <ButtonGroup>
                            <a  href={`https://decentraland.org/play/?position=${urlCoord}`} target="_blank" rel="noopener noreferrer">
                                <Button primary style={{backgroundColor:'#267fd2'}}  size="medium">🏡&nbsp;&nbsp;Visit</Button></a>
                            {showEdit && <Link to={`/edit-ad?adID=${data.ID}`}><Button primary size="medium">✏️&nbsp;&nbsp;Edit</Button></Link>}
                            {showLink && <Link to={`/rent-request?adID=${data.ID}`}><Button primary size="medium">Request</Button></Link>}
                            {showMyRentings && <Link to={`/my-rentings`}><Button primary size="medium">My rentings</Button></Link>}
                            </ButtonGroup>
                            
                            </Card.Meta>
            </Card.Content>
        </Card>
        
       
        
    </div>
}