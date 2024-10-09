import React, {useEffect, useState} from 'react';
import {ActionProps, BaseActionComponent, Edit, useActionResponseHandler, useRecord} from "adminjs";

const Decline = (props: ActionProps) => {
    const [course, setCourse] = useState();
    const {
        record,
        handleChange,
        submit: handleSubmit,
        loading,
        setRecord,
        isSynced,
    } = useRecord(props.record, props.resource.id, {includeParams:["status"]} );
/*    useEffect(()=>{
        (async ()=>{
            const modifiedCourse = await fetch(`/api/get-course/${record.params.course_ID}`).then(r => r.json())
            console.log("modifiedCourse",modifiedCourse);
            setCourse(modifiedCourse);
        })();
    },[]);*/
    return <div>
        <Edit action={props.action} resource={props.resource} record={record}></Edit>
    </div>

}

export default Decline;