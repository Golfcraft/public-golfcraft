
const PHYSX = require('./node_modules/physx-js/dist/physx.release.js')
const WebSocket = require('ws');

let loaded = false
let cb = null
let physics
let scene
let bodies = {}


const PhysX = PHYSX()

let resolve
const promise = new Promise((res) => {
    resolve = res
})
PhysX.ready = () => promise
PhysX.onRuntimeInitialized = () => {
    PhysX.loaded = true
    resolve()
}

const server = new WebSocket.Server({
  port: 8091
});



// Usage

PhysX.ready().then(function () {
    console.log('PhysX ready!')
    //const filterData = new PhysX.PxFilterData(0, 0, 0, 0)

    const version = PhysX.PX_PHYSICS_VERSION
    const defaultErrorCallback = new PhysX.PxDefaultErrorCallback()
    const allocator = new PhysX.PxDefaultAllocator()
    const foundation = PhysX.PxCreateFoundation(
        version,
        allocator,
        defaultErrorCallback
    )

    physics = PhysX.PxCreatePhysics(
        version,
        foundation,
        new PhysX.PxTolerancesScale(),
        false,
        null
    )
    PhysX.PxInitExtensions(physics, null)
    const sceneDesc = PhysX.getDefaultSceneDesc(
        physics.getTolerancesScale(),
        0,
        //physxSimulationCallbackInstance
        null
    )
    scene = physics.createScene(sceneDesc)

    init(e)
    const u = () => {
        update(e)
    }
    a = setInterval(u, 50);


    let sockets = [];
    server.on('connection', function(socket) {
        sockets.push(socket);
        console.log("Connected")
        /*const flags = new PhysX.PxActorTypeFlags(
            PhysX.PxActorFlag.eRIGID_DYNAMIC
        )*/

        // When you receive a message, send that message to every socket.
        socket.on('message', function(msg) {
            if (msg == "E") {
                console.log("E")
                //e[0].transform.position = [0, 50, 0]
                e.forEach(entity => {
                    const body = bodies[entity.id]
                    const transform = body.getGlobalPose()
                    console.log("PhysX.PxActorFlag.eRIGID_DYNAMIC", PhysX.PxActorFlag.eRIGID_DYNAMIC)
                    console.log("PhysX.PxActorFlag", PhysX.PxActorFlag)
                    console.log("body", body) // PxRigidDynamic
                    console.log("body.isSleeping()", body.isSleeping())
                    console.log("body.addForce", body.addForce)
                    console.log("body.addForceAtPos", body.addForceAtPos)
                    console.log("body.addTorque", body.addTorque)
                    console.log("body.clearForce", body.clearForce)
                    console.log("body.getMass", body.getMass)
                    console.log("body.setMass", body.setMass)
                    console.log("body.PxRigidBody", body.PxRigidBody)
                    console.log("body.getNbShapes", body.getNbShapes)
                    console.log("PhysX.PxForceMode.eIMPULSE", PhysX.PxForceMode.eIMPULSE)
                    body.addForceAtPos(transform.translation, transform.translation, PhysX.PxForceMode.eIMPULSE)
                })
            }
            sockets.forEach(s => s.send(JSON.stringify(e)));
        });

        // When a socket closes, or disconnects, remove it from the array.
        socket.on('close', function() {
            sockets = sockets.filter(s => s !== socket);
        });
    });
})


const init = entities => {
    var tmpFilterData = new PhysX.PxFilterData(1, 1, 0, 0)
    const flags = new PhysX.PxShapeFlags(
        PhysX.PxShapeFlag.eSCENE_QUERY_SHAPE.value |
        PhysX.PxShapeFlag.eSIMULATION_SHAPE.value
    )
    //const floor_geometry = new PhysX.PxPlaneGeometry()
    const floor_geometry = new PhysX.PxBoxGeometry(20, 0.1, 20)
    const floor_material = physics.createMaterial(0.2, 0.2, 0.2)
    const floor_shape = physics.createShape(floor_geometry, floor_material, false, flags)
    const floor_transform = {
        translation: {
            x: 5,
            y: 0,
            z: 5,
        },
        rotation: {
            w: 1,
            x: 0,
            y: 0,
            z: 0,
        },
    }
    const floor_body = physics.createRigidStatic(floor_transform)
    floor_shape.setSimulationFilterData(tmpFilterData)
    floor_body.attachShape(floor_shape)
    scene.addActor(floor_body, null)


    entities.forEach(entity => {
        let geometry
        if (entity.body.type === 'box') {
            geometry = new PhysX.PxBoxGeometry(
                // PhysX uses half-extents
                entity.body.size[0] / 2,
                entity.body.size[1] / 2,
                entity.body.size[2] / 2
            )
        }
        if (entity.body.type === 'sphere') {
            geometry = new PhysX.PxSphereGeometry(entity.body.size)
        }
        const material = physics.createMaterial(0.2, 0.2, 0.2)
        const shape = physics.createShape(geometry, material, false, flags)
        const transform = {
            translation: {
                x: entity.transform.position[0],
                y: entity.transform.position[1],
                z: entity.transform.position[2],
            },
            rotation: {
                w: entity.transform.rotation[3], // PhysX uses WXYZ quaternions,
                x: entity.transform.rotation[0],
                y: entity.transform.rotation[1],
                z: entity.transform.rotation[2],
            },
        }
        let body
        if (entity.body.dynamic) {
            body = physics.createRigidDynamic(transform)
        } else {
            body = physics.createRigidStatic(transform)
        }
        shape.setSimulationFilterData(tmpFilterData)
        body.attachShape(shape)
        bodies[entity.id] = body
        scene.addActor(body, null)
    })
}

const update = entities => {
    //console.log("update")
    scene.simulate(1 / 60, true)
    scene.fetchResults(true)
    entities.forEach(entity => {
        const body = bodies[entity.id]
        const transform = body.getGlobalPose()
        //console.log(transform.translation.x, transform.translation.y, transform.translation.z)
        entity.transform.position[0] = transform.translation.x
        entity.transform.position[1] = transform.translation.y
        entity.transform.position[2] = transform.translation.z
        entity.transform.rotation[0] = transform.rotation.x
        entity.transform.rotation[1] = transform.rotation.y
        entity.transform.rotation[2] = transform.rotation.z
        entity.transform.rotation[3] = transform.rotation.w
    })
}

var e = [
    {
        id: 0,
        body: {
            //type: "box",
            //size: [2, 2, 2],
            type: "sphere",
            size: 1,
            dynamic: true
        },
        transform: {
            position: [5, 5, 5],
            rotation: [0, 0, 0, 1]
        }
    }
]
