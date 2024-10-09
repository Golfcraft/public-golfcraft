import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../AppContext";
import {
    BrowserRouter as Router,
    Link,
    useLocation
  } from "react-router-dom";

  const Web3 = require('web3');

  declare const ethereum;
  
  export const web3 = window?.ethereum && new Web3(window?.ethereum) || null;

export  const requestPayment = async (address, ethAmount?) => {
    return new Promise(async (resolve, reject) => {
        try{
            await web3.eth.sendTransaction({
                from: address,
                to: `0xbbF3569836823206c5836997227aeFE717a975E9`.toLowerCase(),
                value: web3.utils.toWei((ethAmount||0.004).toString(), 'ether')
            }, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    alert("transaction "+ result);
                    resolve(result)
                }
            });
        }catch (error){
            reject(error);
        }       
    });
};
export const useAccountContextRedirection = () => {
    const {account}:any = useContext(AppContext);
    useEffect(()=>{
        if(!account.registered || !account.emailVerified) {
            location.href = "/";
            return;
        }
    },[])
}

export const useQuery = () =>  {
    return paramsToObject(new URLSearchParams(useLocation().search) as any) as any;

    function paramsToObject(entries) {
        let result = {}
        for(let entry of entries) { // each 'entry' is a [key, value] tupple
          const [key, value] = entry;
          result[key] = value;
        }
        return result;
      }
}
export const useAccount = () => {
  const appContext:any = useContext(AppContext);
  const {address, registered, emailVerified} = appContext?.account || {};
  return {address, registered, emailVerified};
}