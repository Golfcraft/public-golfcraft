"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vector3 = exports.Quaternion = exports.Gameplay = exports.KinematicSchema = void 0;
const schema_1 = require("@colyseus/schema");
class Vector3 extends schema_1.Schema {
    constructor(x, y, z) {
        super();
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
__decorate([
    schema_1.type('float32')
], Vector3.prototype, "x", void 0);
__decorate([
    schema_1.type('float32')
], Vector3.prototype, "y", void 0);
__decorate([
    schema_1.type('float32')
], Vector3.prototype, "z", void 0);
exports.Vector3 = Vector3;
class Quaternion extends schema_1.Schema {
    constructor(x, y, z, w) {
        super();
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 0;
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
}
__decorate([
    schema_1.type('float32')
], Quaternion.prototype, "x", void 0);
__decorate([
    schema_1.type('float32')
], Quaternion.prototype, "y", void 0);
__decorate([
    schema_1.type('float32')
], Quaternion.prototype, "z", void 0);
__decorate([
    schema_1.type('float32')
], Quaternion.prototype, "w", void 0);
exports.Quaternion = Quaternion;
class KinematicSchema extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.velocity = new Vector3(0, 0, 0);
        this.angularVelocity = new Vector3(0, 0, 0);
        this.position = new Vector3(0, 0, 0);
        this.quaternion = new Quaternion(0, 0, 0, 0);
    }
    updateFromCANNON({ velocity, angularVelocity, position, quaternion }) {
        //console.log("updateFromCANNON", JSON.stringify({ velocity, angularVelocity, position, quaternion }));
        velocity && assignVector(this.velocity, velocity);
        angularVelocity && assignVector(this.angularVelocity, angularVelocity);
        position && assignVector(this.position, position);
        quaternion && assignVector(this.quaternion, quaternion);
        function assignVector(target, source) {
            Object.assign(target, source);
            if (source.w !== undefined)
                target.w = source.w;
        }
    }
}
__decorate([
    schema_1.type(Vector3)
], KinematicSchema.prototype, "velocity", void 0);
__decorate([
    schema_1.type(Vector3)
], KinematicSchema.prototype, "angularVelocity", void 0);
__decorate([
    schema_1.type(Vector3)
], KinematicSchema.prototype, "position", void 0);
__decorate([
    schema_1.type(Quaternion)
], KinematicSchema.prototype, "quaternion", void 0);
exports.KinematicSchema = KinematicSchema;
class Gameplay extends schema_1.Schema {
    constructor({ spawnPosition }) {
        super();
        this.positionBeforeShoot = new Vector3(0, 0, 0);
        this.ball = new KinematicSchema();
        this.ball.updateFromCANNON({
            position: spawnPosition
        });
    }
}
__decorate([
    schema_1.type(Vector3)
], Gameplay.prototype, "positionBeforeShoot", void 0);
__decorate([
    schema_1.type(KinematicSchema)
], Gameplay.prototype, "ball", void 0);
exports.Gameplay = Gameplay;
