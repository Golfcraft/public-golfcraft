var e = new Entity()
e.addComponent(new GLTFShape("models/test_parts.glb"))
engine.addEntity(e)

var elevator = new Entity()
var box = new BoxShape()
box.visible = false
elevator.addComponent(box)
elevator.addComponent(new Transform({
  scale: new Vector3(2, 0.1 ,2)
}))
engine.addEntity(elevator)

var elevator_height = -0.5
var e_pressed = false
var f_pressed = false

const input = Input.instance

input.subscribe("BUTTON_DOWN", ActionButton.PRIMARY, false, (e) => {
  e_pressed = true
})
input.subscribe("BUTTON_UP", ActionButton.PRIMARY, false, (e) => {
  e_pressed = false
})

input.subscribe("BUTTON_DOWN", ActionButton.SECONDARY, false, (e) => {
  f_pressed = true
})
input.subscribe("BUTTON_UP", ActionButton.SECONDARY, false, (e) => {
  f_pressed = false
})

class MoveSystem implements ISystem {
  update() {
    if (e_pressed) {
      elevator_height += 0.1
    }
    if (f_pressed) {
      elevator_height -= 0.1
    }
    var transform = elevator.getComponent(Transform)
    var player_position = Camera.instance.feetPosition
    transform.position.x = player_position.x
    transform.position.y = elevator_height
    transform.position.z = player_position.z
  }
}

engine.addSystem(new MoveSystem())