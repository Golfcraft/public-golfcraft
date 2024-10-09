import {atlasAnalytics} from "../../atlas-analytics-service";

const friends_main = new Entity()
friends_main.addComponent(new Transform({
  position: new Vector3(28, 5, 46),
}))
engine.addEntity(friends_main)


export const createFriends = ()=>{
  const friends_title = new Entity()
  const friends_title_shape = new TextShape("Friend Scenes")
  friends_title.addComponent(friends_title_shape)
  friends_title.addComponent(new Transform({
    position: new Vector3(0, 0, 0),
  }))
  friends_title_shape.fontSize = 2
  friends_title_shape.hTextAlign = "center"
  friends_title_shape.vTextAlign = "bottom"
  friends_title.setParent(friends_main)
  
  const friend_wilderness = new Entity()
  friend_wilderness.addComponent(new PlaneShape())
  const mat_wilderness = new BasicMaterial()
  mat_wilderness.texture = new Texture("images/friends/vroomway.jpg")
  friend_wilderness.addComponent(mat_wilderness)
  friend_wilderness.addComponent(new Transform({
    position: new Vector3(0, -0.8, 0),
    rotation: Quaternion.Euler(180, 180, 0)
  }))
  friend_wilderness.addComponent(new OnPointerDown((e)=>{
    teleportTo('-104,-144')
    atlasAnalytics.submitGenericEvent(`gbc-friend-vroomway`)
    
  },{hoverText: "Go to Vroomway"}))
  friend_wilderness.setParent(friends_main)
}

export const hideFriends = ()=>{
  engine.removeEntity(friends_main);
}

export const showFriends = ()=>{
  engine.addEntity(friends_main)
}
