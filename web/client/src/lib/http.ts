type ErrorResponse = {message:string};
let baseUrl = "";

export const resolveHttpResponse = (result) => {
    return result.status >= 200 && result.status < 300 ? result.json() : result.json().then(j=>Promise.reject(j));
}

export const setBaseUrl = (url) => {
    baseUrl = url;
}

export const resolveFetch = (url, ...args) => {
    return fetch( ~url.indexOf("http")?url:`${baseUrl}${url}`, ...args).then(resolveHttpResponse).then(r=>r, (error)=>{
        console.log("fetch error", url, error);
        if(error.message === "INVALID_TOKEN" || error.status === 400){
            sessionStorage.clear();
            location.pathname = "/";
        }
        return Promise.reject(error);
    })
}

export const resolvePost = (url, payload, headers?):Promise<ErrorResponse|any> => {
    return resolveFetch(url, {
        method:'POST',
        headers:{
            'Content-Type': 'application/json',
            ...headers
        },
        body:JSON.stringify(payload)
    })
}