export const promisifyPlayFab = (fn) => (request) => {
    return new Promise((resolve, reject)=>{
        fn(request, (error, result)=>{
            if(error){
                reject(error);
            }else{
                resolve(result);
            }
        });
    })
}