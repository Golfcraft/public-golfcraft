import fetch from "cross-fetch";

export function callDiscordHook(str:string, url = "https://discord.com/api/webhooks/910083589553684490/XiFafBd3oZlJGccUWqZGcsNpI-XCnVdhhHd1h2BcAVKag1MvuyWYZ4i1Om0xvG7AZ2zM" ){
    console.log(str);
    try{
        var body = {
            username:"Caddie",
            content: `${str}`
        };

        return fetch(url,
            {
                method:"POST",
                body:JSON.stringify(body),
                headers:{'Content-Type':"application/json"}
            })
    }catch(error){
        console.log("discord hook error", error)
    }
}