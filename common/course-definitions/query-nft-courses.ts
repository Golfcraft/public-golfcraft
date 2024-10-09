export const getNFTCoursesQuery = ()=>{
    return {
        "where":{
            "NOT":[{"tokenId":null},{"tokenId":0}],
            "status":2,
            "mode":null
        }
    }
}
export const getNFTAndAdminCoursesQuery = ()=>{
    return {
        "where":{
            "NOT":[{"tokenId":null},{"tokenId":0}],
            "OR":[
                {
                    "status":2,
                    "mode":"competition",
                    "createdBy":"admin"
                },
                {
                    "status":2,
                    "mode":null
                }
            ]
        }
    }
}