import { signedFetch } from '@decentraland/SignedFetch'

const entity = new Entity();
entity.addComponent(new BoxShape());
entity.addComponent(new Transform({
  position: new Vector3(8,1,8)
}));
var log = console.log;

entity.addComponent(new OnPointerDown( async () => {
  let response = await signedFetch('http://localhost:2568/buy-wearable-ft', {
    method:'POST',
    body:JSON.stringify({
      wearableId:0,
      contract:'0x53a7c4bbb0f351f3b1f3f09a3e8288e1528611b1',
      PlayFabId:'34716BBB68B384ED',
      address:"0x05c351382db8d770207f319d96ac1184c3717ede"
    }),
    headers:{
      "Content-Type":"application/json"
    }
  })
  log("response",response)

  let json
  if (response.text) {
    json = await JSON.parse(response.text)
    log("json",json)
  }

  if (json && json.valid === true) {
    log('All good');

  } else {
    log('Not valid');
  }
}));

engine.addEntity(entity);
