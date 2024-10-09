// Decentraland scene

import { NPC, Dialog } from '@dcl/npc-scene-utils'

import wanderer from 'scripts/wanderer'

// UI Log
const canvas = new UICanvas()

const text = new UIText(canvas)
text.value = "Hello world!"
text.vAlign = "bottom"
text.positionX = -80
text.fontSize = 20

var player_state = {
  "listened_messages": [],
  "last_play_type": "",
  "last_play_win": false,

  "listened_messages_this_run": [],
  "level_changed": false,
  "golfclub_upgraded": false,
  "glofclub_minted": false,
  "wearable_minted": false,
  "material_refined": false,
  "part_crafted": false,
  "course_edited": false,
  "course_published": false,

  "level": 0,
}

// Technician
let myNPC_technician = new NPC({ position: new Vector3(2, 0, 8) },
  'models/TestNPCs_01.glb',
  getDialogueTechnician,
  {
    faceUser: true,
    onlyClickTrigger: true,
    onlyETrigger: true
  })

function getDialogueTechnician(): void {
  getDialogue("technician", myNPC_technician)
}

// Designer
let myNPC_designer = new NPC({ position: new Vector3(4, 0, 8) },
  'models/TestNPCs_02.glb',
  getDialogueDesigner,
  {
    faceUser: true,
    onlyClickTrigger: true,
    onlyETrigger: true
  })

function getDialogueDesigner(): void {
  getDialogue("designer", myNPC_designer)
}

// Gardener
let myNPC_gardener = new NPC({ position: new Vector3(6, 0, 8) },
  'models/TestNPCs_03.glb',
  getDialogueGardener,
  {
    faceUser: true,
    onlyClickTrigger: true,
    onlyETrigger: true
  })

function getDialogueGardener(): void {
  getDialogue("gardener", myNPC_gardener)
}

// Trainer
let myNPC_trainer = new NPC({ position: new Vector3(8, 0, 8) },
  'models/TestNPCs_04.glb',
  getDialogueTrainer,
  {
    faceUser: true,
    onlyClickTrigger: true,
    onlyETrigger: true
  })

function getDialogueTrainer(): void {
  getDialogue("trainer", myNPC_trainer)
}

// Wanderer
let myNPC_wanderer = new NPC({ position: new Vector3(10, 0, 8) },
  'models/TestNPCs_05.glb',
  getDialogueWanderer,
  {
    faceUser: true,
    onlyClickTrigger: true,
    onlyETrigger: true
  })

function getDialogueWanderer(): void {
  getDialogue("wanderer", myNPC_wanderer)
}


function getDialogue(character_name: string, myNPC: NPC): void {
  text.value = character_name
  var data: any
  if (character_name == "wanderer") {
    data = wanderer
  } else {
    return
  }
  log(data)
  for (var d in data) {
    log(d)
    log(data[d])
    let ILoveCats: Dialog[] = [
      {
        text: data[d].Dialogue[0].Text,
        isEndOfDialog: true
      }
    ]
    myNPC.talk(ILoveCats, 0)
    break
  }
}


function getDialogue_(character_name: String, myNPC: NPC): void {
  //const character_name = "wanderer"
  const user_id = "0x0"
  const url = `http://localhost:2568/npc-dialogue/${character_name}/${user_id}`
  
  executeTask(async () => {
    try {
      let response = await fetch(url)
      let json = await response.json()

      let ILoveCats: Dialog[] = [
        {
          text: json.t,
          isEndOfDialog: true
        }
      ]
      myNPC.talk(ILoveCats, 0)

    } catch {
      log("failed to reach URL")
      let ILoveCats: Dialog[] = [
        {
          text: "hmm",
          isEndOfDialog: true
        }
      ]
      myNPC.talk(ILoveCats, 0)
    }
  })

}





// Boxes to fire actions


function reset_state(state: any) {
  return {
    ...state,
  
    "listened_messages_this_run": [],
    "level_changed": false,
    "golfclub_upgraded": false,
    "glofclub_minted": false,
    "wearable_minted": false,
    "material_refined": false,
    "part_crafted": false,
    "course_edited": false,
    "course_published": false,
  }
} 


const tags: any = {
  "Play Training": (state: any) => {
    log("Training")
    var msg = "Training: "
    state = reset_state(state)
    state.last_play_type = "training"
    state.last_play_win = Math.random() > 0.5
    if (state.last_play_win){
      msg += "You won! "
    } else {
      msg += "You lose! "
    }
    text.value = msg
    log(msg)
    return state
  },
  "Play Competition": (state: any) => {
    state = reset_state(state)
    state.last_play_type = "competition"
    return state
  },
  "Play Tournament": (state: any) => {
    state = reset_state(state)
    state.last_play_type = "tournament"
    return state
  },
  "Upgrade golfclub": (state: any) => {
    return state
  },
  "Mint golfclub": (state: any) => {
    return state
  },
  "Mint wearable": (state: any) => {
    return state
  },
  "Refine material": (state: any) => {
    return state
  },
  "Craft part": (state: any) => {
    return state
  },
  "Edit course": (state: any) => {
    return state
  },
  "Publish course": (state: any) => {
    return state
  },
}

// for each tag in tags
let counter = 0
let boxshape = new BoxShape()
for (let tag_idx in tags) {
  // var tag = tags[tag_idx]
  var tag_box = new Entity()
  tag_box.addComponent(boxshape)
  tag_box.addComponent(new Transform({
    position: new Vector3(12, (counter/5)+0.25, 8),
    scale: new Vector3(0.15, 0.15, 0.15)
  }))

  engine.addEntity(tag_box)

  tag_box.addComponent(new OnPointerDown (() => {
    //sendTag(tag_idx) 
    log(tags[tag_idx])
    player_state = tags[tag_idx](player_state)
  },
  {
    button: ActionButton.PRIMARY,
    showFeedback: true,
    hoverText: tag_idx,
  }))

  counter++
}

function sendTag(tag: string) {
  const user_id = "0x0"
    const url = `http://localhost:2568/user-tags/${user_id}`
    const myBody = {"tags":[tag]}
    executeTask(async () => {
      try {
        let response = await fetch(url, {
          headers: { "Content-Type": "application/json" },
          method: "POST",
          body: JSON.stringify(myBody),
        })
        let json = await response.json()
      } catch {
        log("failed to reach URL")
      }
    })
}