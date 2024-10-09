import fetch from "cross-fetch";

export const fetchRemoteCourses = async ({where})=>{
    //TODO optimize + cache endpoint?
    return await fetch(`https://golfcraftgame.com/api/courses`, {
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            where
        })
    }).then(async r => await r.json()).then(c=>c.map(i=>i.alias));
}
export type RemoteCourseData = {
    courseId:string,
    metadata:{GC:number, xp:number, minLevel:number}
}
export const fetchRemoteCoursesData = async ({where})=>{
    //TODO optimize + cache endpoint?
    try{
        return await fetch(`https://golfcraftgame.com/api/courses`, {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                where
            })
        }).then(async r => await r.json()).then(c=>{
            return c.map(({alias, metadata})=>{
                return {
                    courseId:alias, metadata:JSON.parse(metadata)
                } as RemoteCourseData;
            })
        });
    }catch(err){
        console.error(err);
        return Promise.resolve([]);
    }

}