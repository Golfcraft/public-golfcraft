const socket = new WebSocket(`ws://localhost:8091`)

// Objects
const ground = new Entity()
ground.addComponent(new Transform())

const ball = new Entity()
ball.addComponent(new GLTFShape("src/Ball.glb"))
ball.addComponent(new Transform())
engine.addEntity(ball)

const floor = new Entity()
floor.addComponent(new GLTFShape("src/Floor.glb"))
floor.addComponent(new Transform())
engine.addEntity(floor)

const border = new Entity()
border.addComponent(new GLTFShape("src/Border.glb"))
border.addComponent(new Transform())
engine.addEntity(border)

const objects: Array<Entity> = [
    ground,
    floor,
    border,
    ball
]


// Physics
socket.onmessage = function (event) {
    const parsed = JSON.parse(event.data)
    if (parsed.length != objects.length) return;
    for (let i=0; i < objects.length; i++) {
        const t = objects[i].getComponent(Transform)
        t.position.x = parsed[i].transform.position[0]
        t.position.y = parsed[i].transform.position[1]
        t.position.z = parsed[i].transform.position[2]

        t.rotation.x = parsed[i].transform.rotation[0]
        t.rotation.y = parsed[i].transform.rotation[1]
        t.rotation.z = parsed[i].transform.rotation[2]
        t.rotation.w = parsed[i].transform.rotation[3]
    }
}

// Instance the input object
const input = Input.instance

// button down event
input.subscribe("BUTTON_DOWN", ActionButton.PRIMARY, false, (e) => {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send("E")
        log("send")
    } else {
        log("closed")
    }
})

input.subscribe("BUTTON_DOWN", ActionButton.SECONDARY, false, (e) => {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send("F")
        log("send")
    } else {
        log("closed")
    }
})

input.subscribe("BUTTON_DOWN", ActionButton.ACTION_3, false, (e) => {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send("1")
        log("send")
    } else {
        log("closed")
    }
})

input.subscribe("BUTTON_DOWN", ActionButton.ACTION_4, false, (e) => {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send("2")
        log("send")
    } else {
        log("closed")
    }
})

input.subscribe("BUTTON_DOWN", ActionButton.ACTION_5, false, (e) => {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send("3") 
        log("send")
    } else {
        log("closed")
    }
})

input.subscribe("BUTTON_DOWN", ActionButton.ACTION_6, false, (e) => {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send("4")
        log("send")
    } else {
        log("closed")
    }
})

export class MoveSystem implements ISystem {
    time = 0

    update(td:number) {
        this.time += td
        if (this.time < 0.06) return;
        if (socket.readyState === WebSocket.OPEN) {
            socket.send("123")
            //log("send")
        } else {
            //log("closed")
        }
    }
}

// Add system to engine
engine.addSystem(new MoveSystem())
