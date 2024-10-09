import { TagComponent } from "./imports/index"
import { SignPanel,SignBook } from "./signBook"

//   Load Sign Panel
function loadSignPanel(address:string, name:string) {
  var signPanelsArray: SignPanel[] = []
  for (const entityId in engine.getEntitiesWithComponent(TagComponent)) {
    let entity: IEntity = engine.getEntitiesWithComponent(TagComponent)[entityId]
    if (entity.getComponent(TagComponent).tag=="Signpanel") {
      let panelInfo = {
        board: null, next: null, back: null, pages: null
      }
      for (const childid in entity.children) {
        let child = entity.children[childid]
        if (child.hasComponent(TagComponent)) {
          if (child.getComponent(TagComponent).tag=="Signpanel_Board") {
            panelInfo.board = child
          }
          else if (child.getComponent(TagComponent).tag=="Signpanel_Next") {
            panelInfo.next = child
          }
          else if (child.getComponent(TagComponent).tag=="Signpanel_Back") {
            panelInfo.back = child
          }
          else if (child.getComponent(TagComponent).tag=="Signpanel_Pages") {
            panelInfo.pages = child
          }
        }
      }
      if (panelInfo.board && panelInfo.next && panelInfo.back && panelInfo.pages) {
        var pannel = new SignPanel(entity, panelInfo.board, panelInfo.next, panelInfo.back, panelInfo.pages)
        entity.addComponent(pannel)
        signPanelsArray.push(pannel)
      }
    }
  }
  for (const entityId in engine.getEntitiesWithComponent(TagComponent)) {
    let entity: IEntity = engine.getEntitiesWithComponent(TagComponent)[entityId]
    if (entity.getComponent(TagComponent).tag=="Signpanel_Sign") {
        entity.addComponent(new SignBook(entity, address, name, signPanelsArray))
    }
  }
}

/*
function loadUser() {
  //Load user name/id
  executeTask(async () => {
    try {
      const userData = await getUserData()
      const address = await getUserAccount()
      loadSignPanel(address, userData.displayName)
    } catch (error) {
      log(error.toString())
    }
  })
}*/


export const loadInit = function(){
}
loadInit()
