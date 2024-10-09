const Ammo = require('./ammo.wasm.js')
const WebSocket = require('ws')

const server = new WebSocket.Server({
  port: 8091
});

const Border = require('../Border.js');
const Floor = require('../Floor.js');

const ACTIVE_TAG = 1;
const ISLAND_SLEEPING = 2;
const WANTS_DEACTIVATION = 3;
const DISABLE_DEACTIVATION = 4;
const DISABLE_SIMULATION = 5;

var direction = 0;
directions = [
    [1, 0, 0],
    [0, 0, 1],
    [-1, 0, 0],
    [0, 0, -1]
]
var force = 1;


Ammo().then(function(Ammo) {
    function main() {
        var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(),
        dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration),
        overlappingPairCache = new Ammo.btDbvtBroadphase(),
        solver = new Ammo.btSequentialImpulseConstraintSolver(),
        dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
        dynamicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));

        var groundShape = new Ammo.btBoxShape(new Ammo.btVector3(50, 50, 50)),
            bodies = [],
            groundTransform = new Ammo.btTransform();

        groundTransform.setIdentity();
        groundTransform.setOrigin(new Ammo.btVector3(0, -50, 0));

        // Ground
        (function() {
            var mass = 0,
                isDynamic = (mass !== 0),
                localInertia = new Ammo.btVector3(0, 0, 0);

            if (isDynamic)
            groundShape.calculateLocalInertia(mass, localInertia);

            var myMotionState = new Ammo.btDefaultMotionState(groundTransform),
                rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, groundShape, localInertia),
                body = new Ammo.btRigidBody(rbInfo);

            dynamicsWorld.addRigidBody(body);
            bodies.push(body);
        })();


        // Floor
        (function() {
            var triangleMesh = new Ammo.btTriangleMesh();
            for (let i = 0; i <  Floor.obj.length; i++) {
                var vertices = []
                for (let ii = 0; ii <  Floor.obj[i].length; ii++) {
                    var vertex = new Ammo.btVector3(
                        Floor.obj[i][ii][0],
                        Floor.obj[i][ii][1],
                        Floor.obj[i][ii][2]
                    );
                    vertices.push(vertex);
                }
                //console.log(vertices)
                triangleMesh.addTriangle(vertices[0], vertices[1], vertices[2]);
            }

            var bvhTriangleMeshShape = new Ammo.btBvhTriangleMeshShape(triangleMesh, true, true);
            var triangleMeshTransform = new Ammo.btTransform();
            triangleMeshTransform.setIdentity();
            triangleMeshTransform.setOrigin(new Ammo.btVector3(5, 0.1, 13));
            var mass = 0;
            var localInertia = new Ammo.btVector3(0, 0, 0);
            var myMotionState = new Ammo.btDefaultMotionState(triangleMeshTransform);
            var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, bvhTriangleMeshShape, localInertia);
            rbInfo.m_linearDamping = 0.;  // Default: 0
            rbInfo.m_friction = 0.9;  // Default: 0.5
            rbInfo.m_restitution = 0.;  // Default: 0
            rbInfo.m_additionalDamping = false;  // Default: false
            rbInfo.m_additionalDampingFactor = 0.005;  // Default: 0.005
            var body = new Ammo.btRigidBody(rbInfo);

            dynamicsWorld.addRigidBody(body);
            bodies.push(body);
        })();

        // Border
        (function() {
            var triangleMesh = new Ammo.btTriangleMesh();
            for (let i = 0; i <  Border.obj.length; i++) {
                var vertices = []
                for (let ii = 0; ii <  Border.obj[i].length; ii++) {
                    var vertex = new Ammo.btVector3(
                        Border.obj[i][ii][0],
                        Border.obj[i][ii][1],
                        Border.obj[i][ii][2]
                    );
                    vertices.push(vertex);
                }
                //console.log(vertices)
                triangleMesh.addTriangle(vertices[0], vertices[1], vertices[2]);
            }

            var bvhTriangleMeshShape = new Ammo.btBvhTriangleMeshShape(triangleMesh, true, true);
            var triangleMeshTransform = new Ammo.btTransform();
            triangleMeshTransform.setIdentity();
            triangleMeshTransform.setOrigin(new Ammo.btVector3(5, 0.1, 13));
            var mass = 0;
            var localInertia = new Ammo.btVector3(0, 0, 0);
            var myMotionState = new Ammo.btDefaultMotionState(triangleMeshTransform);
            var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, bvhTriangleMeshShape, localInertia);
            rbInfo.m_linearDamping = 0.;  // Default: 0
            rbInfo.m_friction = 0.5;  // Default: 0.5
            rbInfo.m_restitution = 0.5;  // Default: 0
            rbInfo.m_additionalDamping = false;  // Default: false
            rbInfo.m_additionalDampingFactor = 0.005;  // Default: 0.005
            var body = new Ammo.btRigidBody(rbInfo);
            dynamicsWorld.addRigidBody(body);
            bodies.push(body);
        })();


        // Ball
        (function() {
            var colShape = new Ammo.btSphereShape(0.1),
            startTransform = new Ammo.btTransform();

            startTransform.setIdentity();

            var mass = 1,
            isDynamic = (mass !== 0),
            localInertia = new Ammo.btVector3(0, 0, 0);

            if (isDynamic)
            colShape.calculateLocalInertia(mass,localInertia);

            startTransform.setOrigin(new Ammo.btVector3(5, 1.5, 13));

            var myMotionState = new Ammo.btDefaultMotionState(startTransform);
            var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, colShape, localInertia);
            rbInfo.m_linearDamping = 0.;  // Default: 0
            rbInfo.m_friction = 0.8;  // Default: 0.5
            rbInfo.m_restitution = 0.2;  // Default: 0
            rbInfo.m_additionalDamping = false;  // Default: false
            rbInfo.m_additionalDampingFactor = 0.005;  // Default: 0.005
            rbInfo.m_rollingFriction = 5;  // Default: 0.
            rbInfo.m_spinningFriction = 5;  // Default: 0.
            var body = new Ammo.btRigidBody(rbInfo);
            body.setActivationState(DISABLE_DEACTIVATION);

            dynamicsWorld.addRigidBody(body);
            bodies.push(body);
        })();

        var trans = new Ammo.btTransform(); // taking this out of the loop below us reduces the leaking

        const u = () => {
            dynamicsWorld.stepSimulation(1/60, 10);
        }
        a = setInterval(u, 1000/60);

        let sockets = [];
        server.on('connection', function(socket) {
            sockets.push(socket);
            console.log("Connected")

            // When you receive a message, send that message to every socket.
            socket.on('message', function(msg) {
                if (msg == "E") {
                    console.log("E")
                    bodies[3].getMotionState().getWorldTransform(trans);
                    bodies[3].setActivationState(ACTIVE_TAG);
                    const vector = new Ammo.btVector3(
                        directions[direction][0] * force,
                        directions[direction][1] * force,
                        directions[direction][2] * force,
                    )
                    bodies[3].applyCentralImpulse(vector);
                } else if (msg == "F") {
                    console.log("F")
                    direction += 1
                    if (direction >= directions.length) {
                        direction = 0;
                    }
                } else if (msg == "1") {
                    console.log("1")
                    force = 1
                } else if (msg == "2") {
                    console.log("2")
                    force = 2
                } else if (msg == "3") {
                    console.log("3")
                    force = 10
                } else if (msg == "4") {
                    var resetTransform = new Ammo.btTransform();
                    resetTransform.setOrigin(new Ammo.btVector3(5, 1, 13));
                    bodies[3].setWorldTransform(resetTransform)
                }
                var e = []
                for (let i=0; i < bodies.length; i++) {
                    const ms = bodies[i].getMotionState();
                    ms.getWorldTransform(trans);
                    const p = trans.getOrigin();
                    const q = trans.getRotation();
                    e.push({
                        transform: {
                            position: [p.x(), p.y(), p.z()],
                            rotation: [q.x(), q.y(), q.z(), q.w()]
                        }
                    })
                }
                sockets.forEach(s => s.send(JSON.stringify(e)));
            });

            // When a socket closes, or disconnects, remove it from the array.
            socket.on('close', function() {
                // Delete objects we created through |new|. We just do a few of them here, but you should do them all if you are not shutting down ammo.js
                // we'll free the objects in reversed order as they were created via 'new' to avoid the 'dead' object links
                Ammo.destroy(dynamicsWorld);
                Ammo.destroy(solver);
                Ammo.destroy(overlappingPairCache);
                Ammo.destroy(dispatcher);
                Ammo.destroy(collisionConfiguration);

                sockets = sockets.filter(s => s !== socket);
            });
        });



        console.log("Ok")
    }

    main();
});
