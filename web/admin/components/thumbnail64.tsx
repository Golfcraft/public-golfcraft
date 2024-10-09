import React from 'react';

const Thumbnail64 = (props: any) => {
   const {record, filter, onChange, property, resource} = props;
   const {thumbnail64} = record.params
   return <img src={`data:image/png;base64,${thumbnail64}`} />;

}

export default Thumbnail64;