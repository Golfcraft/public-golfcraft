import React, {useEffect} from 'react';
import ReactJson from 'react-json-view'
import {useRecord} from "adminjs";

const JSONEditor = (props: any) => {
   const {record:initialRecord, filter, onChange, property, resource} = props;
   const {
      record,
      handleChange: change,
      loading,
      setRecord,
   } = useRecord(initialRecord, resource.id);
   useEffect(() => {
      if (initialRecord) {
         setRecord(initialRecord)
      }
   }, [initialRecord])
const handleChange = ({new_value, existing_src, existing_value, updated_src, name, namespace})=>{
      console.log("args",{new_value, existing_src, existing_value, updated_src, name, namespace});
      console.log("record",record);
      console.log("initialRecord",initialRecord);
      console.log("i === r", JSON.stringify(record) === JSON.stringify(initialRecord));
        _set(record.params, property.name+namespace.join(".") + (name?("."+name):""), new_value);
/*      change(
          property.name,
          name+"."+namespace,//path
          new_value
      );*/
}
   return <div className={"adminjs_Box"}>
      <label className={"adminjs_Label"}>{property.label}</label>
      <ReactJson onEdit={handleChange} onAdd={handleChange} onDelete={handleChange} src={getJSONProperty(property.name, record.params)}></ReactJson>
      <br/>
   </div>;

   function getJSONProperty(propertyName, params){
      if(params[propertyName]){
         return params[propertyName];
      }else{
         const keys = Object.keys(params).filter(k=>~k.indexOf(property.name));
         const result = [];
         keys.forEach(keyName => {
            const [,...positions] = keyName.split(".").map(p=>Number(p));

            _set(result, positions.map(p=>`[${p}]`).join(""),params[keyName]);
         });
         return result;
      }
   }
}

export default JSONEditor;

function _set(obj, path, value) {
   if (Object(obj) !== obj) return obj; // When obj is not an object
   // If not yet an array, get the keys from the string-path
   if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || [];
   path.slice(0,-1).reduce((a, c, i) => // Iterate all of them except the last one
           Object(a[c]) === a[c] // Does the key exist and is its value an object?
               // Yes: then follow that path
               ? a[c]
               // No: create the key. Is the next key a potential array-index?
               : a[c] = Math.abs(path[i+1])>>0 === +path[i+1]
                   ? [] // Yes: assign a new array object
                   : {}, // No: assign a new plain object
       obj)[path[path.length-1]] = value; // Finally assign the value to the last key
   return obj; // Return the top-level object to allow chaining
};