import React from "react";

declare const ethereum;
export const AppContext = React.createContext({
    contextState:{
        selectedAddress:window?.ethereum?.selectedAddress || null,
        hasMetamask:!!window?.ethereum,
        profile:null
    },
    connect:()=>{}});

export const AppContextProvider = ({value, connect, children}) => {
    const {contextState} = value;

    window.ethereum?.on('accountsChanged', (accounts) => {
        window.location.reload();
    });

    window.ethereum?.on('chainChanged', (chainId) => {
       console.log("chainId", chainId)
    });

    return <AppContext.Provider value={{
        contextState,
        connect
    }}>{children}</AppContext.Provider>;
}