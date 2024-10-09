import { signedFetch } from '@decentraland/SignedFetch'

const entity = new Entity();
entity.addComponent(new BoxShape());
entity.addComponent(new Transform({
  position: new Vector3(8,1,8)
}));
var log = console.log;

entity.addComponent(new OnPointerDown( async () => {
  let response = await signedFetch('http://localhost:2568/buy-pet-pt', {
    method:'POST',
    body:JSON.stringify({
      crateId:"pet-crate-1",
      PlayFabId:'34716BBB68B384ED', // Eibriel#7ede
      address:"0x05C351382dB8D770207F319D96ac1184c3717edE"
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
