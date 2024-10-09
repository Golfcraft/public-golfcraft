import React, {useContext} from "react";
import "./Header.scss"
import { AppContext } from "../AppContext";
import {Navbar, Menu, Blockie, AvatarFace} from "decentraland-ui";
import {
    Link
  } from "react-router-dom";


export const AccountAvatar = () => {
    const {contextState, connect} : any = useContext(AppContext);
    const {hasMetamask, selectedAddress, profile} = contextState;
    const NOT_CONNECTED = <div className={'Account Account-disconnected'} onClick={()=>hasMetamask && connect()}>
        <div style={{width:`140px`}}>
            🔴 Not connected<br/>
        </div>
    </div> || null;
    const avatar = profile;
   if(!hasMetamask || !selectedAddress){
       return NOT_CONNECTED;
   }else{

       return <div className={'Account'}>

           <div style={{display:'inline-block', marginRight:'10px', verticalAlign:'top'}}>
               {avatar
                   ? <Link to="/my-courses"><AvatarFace avatar={avatar}  size="medium" inline></AvatarFace></Link>
                    : <Blockie seed={selectedAddress} />
               }</div>
           <div style={{width:`110px`, display:'inline-block'}}>
               🟢 {avatar?.name || null}<br/>
               <div style={{fontSize:`14px`, color:`grey`, width:`100%`, whiteSpace:'nowrap', textOverflow:'ellipsis', overflow:'hidden'}}>{selectedAddress}</div>
           </div>
       </div>;
   }
}

export const Header = () => {
    const appContext:any = useContext(AppContext);
    const {address, registered, emailVerified} = appContext?.account ||{};
    return <header className={`Header`}>    
          <div className="Navbar-story-container">

        <Navbar
            isConnected={registered && emailVerified}
            address={address}
            leftMenu={
            <>
                    <img className={`Logo-img`} src="static/images/logo.png" />
                    <Menu.Item><Link to="">Home</Link></Menu.Item>
                    <Menu.Item><Link to="tournaments">tournaments</Link></Menu.Item>
                    <Menu.Item><Link to="create-tournament">create tournament</Link></Menu.Item>
                    <Menu.Item><a href="https://discord.com/invite/2tshKm6UzJ">DISCORD</a></Menu.Item>
                    <Menu.Item><a href="https://twitter.com/GolfcraftGame">TWITTER</a></Menu.Item>
            </>

        }   
            rightMenu={
                    <AccountAvatar />
            }
        
        >

        </Navbar>
        </div>
       
       
        
    </header>;
}