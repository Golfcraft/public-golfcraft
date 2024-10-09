import { sleep } from "../../common/utils";

const fetch = require("cross-fetch");

export function tryFetch(times, url, options:any = {maxMs:3000, delayMs:100}):Promise<any>{
    let counter = 0;
    const {maxMs, delayMs} = options||{};
    const started = Date.now();

    return new Promise(async (resolve, reject)=>{
        let finished = false;
        let interval = setInterval(()=>{
            if(started + maxMs < Date.now() ){
                finished = true;
                reject({error:"Max time for request"});
                clearInterval(interval);
            }
        }, delayMs);
        let result;
        try{
            result = await _tryFetch(url, options);
        }catch(e){
            clearInterval(interval);
            finished = true;
            reject(e)
        }
        clearInterval(interval);
        if(!finished){

            finished = true;
            resolve(result);
        }
    });

    async function _tryFetch(url, options){

        counter++;
        try{
            const result = await fetch(url, options);

            return result;
        }catch(err){
            console.log("fetch error", err)
            if(counter === times){
                return Promise.reject(err);
            }else{
                await sleep(delayMs);
                return await _tryFetch(url, options);
            }
        }
    }
}