import React, {useEffect, useState} from "react";

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";
import {CreateTournament} from "./pages/CreateTournament";

import {Header} from "./components/Header";
import {Home} from "./pages/Home";
import 'decentraland-ui/lib/styles.css'
import "./AppView.scss";
import 'decentraland-ui/lib/dark-theme.css';
import { Container } from "decentraland-ui";
import {ViewTournament} from "./pages/ViewTournament";
import {Tournaments} from "./pages/Tournaments";
import {RequireWeb3Wallet} from "./components/RequireMetamask";
import {AppContextProvider} from "./AppContext";
import {getAvatars} from "../lib/avatars";
import {resolveFetch} from "../lib/http";
import {useLocalStorage} from "./hooks/use-localstorage";
import {BuilderContest} from "./pages/BuilderContest";
import {MyCourses} from "./pages/MyCourses";
const avatars = getAvatars();

export const AppView = () => {
    const [contextState, setContextState] = useState({
        hasMetamask:!!window?.ethereum,
        selectedAddress: window?.ethereum?.selectedAddress || null,
        profile:getAvatars()[window?.ethereum?.selectedAddress] || null
    });
    const [,setAvatars] = useLocalStorage("avatars");

    const connect = async () => {
        if(!ethereum) return;

        if(!ethereum.selectedAddress){
            await ethereum.request({ method: 'eth_requestAccounts' });//to connect
        }
        const {selectedAddress} = ethereum;
        const profile = avatars[selectedAddress] || await resolveFetch(`https://peer-lb.decentraland.org/lambdas/profiles?id=${selectedAddress}`).then(r=>{
            return r?.length && r[0].avatars?.length && r[0].avatars[0];
        });
        if(!avatars[selectedAddress] && profile){
            avatars[selectedAddress] = profile;
            try{
                setAvatars(avatars);
            }catch(e){console.error(e)}
        }
        const newState = {
            ...contextState,
            selectedAddress,
            profile
        }

        setContextState(newState);
    };

    useEffect(()=>{
        connect();
    },[]);

    const value = {contextState, setContextState};

    return <Container>
        <AppContextProvider connect={connect} value={value}>
             <Router basename={DEV_MODE && "/" || "/"}>
                <Header></Header>
                  <Switch>
                      <Route path="/create-tournament" >
                        <div className="content">
                            <RequireWeb3Wallet>
                                <CreateTournament />
                            </RequireWeb3Wallet>
                        </div>
                      </Route>
                      <Route path="/view-tournament">
                          <div className="content"><ViewTournament /></div>
                      </Route>
                      <Route path="/tournaments">
                          <div className="content"><Tournaments /></div>
                      </Route>
                      <Route path="/builder-contest">
                          <div className="content"><BuilderContest /></div>
                      </Route>
                      <Route path="/my-courses">
                          <div className="content"><MyCourses /></div>
                      </Route>
                      <Route path="/courses">
                          <div className="content"><MyCourses /></div>
                      </Route>
                      <Route path="/">
                        <Home />
                    </Route>
                  </Switch>
            </Router>
        </AppContextProvider>
    </Container>
}