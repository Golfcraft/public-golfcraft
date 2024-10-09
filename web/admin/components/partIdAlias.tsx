import React, {useEffect, useState} from 'react';

const RecordIdAlias = (props: any) => {
    const {record, filter, onChange, property, resource} = props;
    const {ID} = record.params;
    const [part, setPart] = useState({alias:""});
    useEffect(()=>{
        (async ()=>{
            if(resource.id === "part_modification" && record.params.part_ID){
                setPart(await fetch(`/api/get-part/${record.params.part_ID}`).then(r=>r.json()))
            }else if(resource.id === "course_modification" && record.params.course_ID){
                setPart(await fetch(`/api/get-course/${record.params.course_ID}`).then(r=>r.json()))
            }

        })();
    },[])
    return <span>{record.params.part_ID || record.params.course_ID} ({part?.alias})</span>

}

export default RecordIdAlias;