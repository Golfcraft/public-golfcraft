"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadCoursePhysics = void 0;
const Bloque1x1x025_1 = __importDefault(require("./models/Bloque1x1x025"));
const Bloque1x2x1_1 = __importDefault(require("./models/Bloque1x2x1"));
const Bloque05x2x05_1 = __importDefault(require("./models/Bloque05x2x05"));
const Bloque05x05x025_1 = __importDefault(require("./models/Bloque05x05x025"));
const Bloque175x50x50_1 = __importDefault(require("./models/Bloque175x50x50")); //TODO its really 350(x)
const Corner1_1 = __importDefault(require("./models/Corner1"));
const Corner2_1 = __importDefault(require("./models/Corner2"));
const End1_1 = __importDefault(require("./models/End1"));
const End2_1 = __importDefault(require("./models/End2"));
const End3_1 = __importDefault(require("./models/End3"));
const End4_1 = __importDefault(require("./models/End4"));
const End5_1 = __importDefault(require("./models/End5"));
const Part1_1 = __importDefault(require("./models/Part1"));
const Part2_1 = __importDefault(require("./models/Part2"));
const Part3_1 = __importDefault(require("./models/Part3"));
const Part4_1 = __importDefault(require("./models/Part4"));
const Part5_1 = __importDefault(require("./models/Part5"));
const Part6_1 = __importDefault(require("./models/Part6"));
const Part7_1 = __importDefault(require("./models/Part7"));
const Cylinder1_1 = __importDefault(require("./models/Cylinder1"));
const Tabla_1 = __importDefault(require("./models/Tabla"));
const Curve_1 = __importDefault(require("./models/Curve"));
const TreePine_1 = __importDefault(require("./models/TreePine"));
const Base48_1 = __importDefault(require("./models/Base48"));
const House7_1 = __importDefault(require("./models/House7"));
const River_1 = __importDefault(require("./models/River"));
const Bridge_1 = __importDefault(require("./models/Bridge"));
const PetHouse_1 = __importDefault(require("./models/PetHouse"));
const Ramp1_1 = __importDefault(require("./models/Ramp1"));
const Ramp2_1 = __importDefault(require("./models/Ramp2"));
const Sand1_1 = __importDefault(require("./models/Sand1"));
const Skybox1_1 = __importDefault(require("./models/Skybox1"));
const Start1_1 = __importDefault(require("./models/Start1"));
const Wall1_1 = __importDefault(require("./models/Wall1"));
const Wind1_1 = __importDefault(require("./models/Wind1"));
const Dumper_1 = __importDefault(require("./models/Dumper"));
const Gutter_1 = __importDefault(require("./models/Gutter"));
const GutterFunnel_1 = __importDefault(require("./models/GutterFunnel"));
const PartBigCurve_1 = __importDefault(require("./models/PartBigCurve"));
const PartBigCurveB_1 = __importDefault(require("./models/PartBigCurveB"));
const PartCurves_1 = __importDefault(require("./models/PartCurves"));
const PartTeeth_1 = __importDefault(require("./models/PartTeeth"));
const PartWave_1 = __importDefault(require("./models/PartWave"));
const world_1 = require("./world");
const cannonParts = {
    Bloque1x1x025: Bloque1x1x025_1.default,
    Bloque1x2x1: Bloque1x2x1_1.default,
    Bloque05x2x05: Bloque05x2x05_1.default,
    Bloque05x05x025: Bloque05x05x025_1.default,
    Bloque175x50x50: Bloque175x50x50_1.default,
    Corner1: Corner1_1.default,
    Corner2: Corner2_1.default,
    End1: End1_1.default,
    End2: End2_1.default,
    End3: End3_1.default,
    End4: End4_1.default,
    End5: End5_1.default,
    Part1: Part1_1.default,
    Part2: Part2_1.default,
    Part3: Part3_1.default,
    Part4: Part4_1.default,
    Part5: Part5_1.default,
    Part6: Part6_1.default,
    Part7: Part7_1.default,
    Cylinder1: Cylinder1_1.default,
    Tabla: Tabla_1.default,
    Curve: Curve_1.default,
    TreePine: TreePine_1.default,
    Base48: Base48_1.default,
    House7: House7_1.default,
    River: River_1.default,
    Bridge: Bridge_1.default,
    PetHouse: PetHouse_1.default,
    Ramp1: Ramp1_1.default,
    Ramp2: Ramp2_1.default,
    Sand1: Sand1_1.default,
    Skybox1: Skybox1_1.default,
    Start1: Start1_1.default,
    Wall1: Wall1_1.default,
    Wind1: Wind1_1.default,
    Dumper: Dumper_1.default,
    Gutter: Gutter_1.default,
    GutterFunnel: GutterFunnel_1.default,
    PartBigCurve: PartBigCurve_1.default,
    PartBigCurveB: PartBigCurveB_1.default,
    PartCurves: PartCurves_1.default,
    PartTeeth: PartTeeth_1.default,
    PartWave: PartWave_1.default
};
const loadCoursePhysics = (world, { courseDefinition }) => {
    const physicParts = courseDefinition.parts.map((partDefinition) => {
        return (partDefinition.type === "solid") && loadPartPhysics(world, { partDefinition }); //TODO REVIEW: instead of checking id, maybe say "solid:true"?
    }).filter(p => p);
    return physicParts.reduce((acc, part) => {
        acc[part.id] = {
            definition: part.definition,
            bodies: part.bodies
        };
        return acc;
    }, {});
};
exports.loadCoursePhysics = loadCoursePhysics;
const loadPartPhysics = (world, { partDefinition }) => {
    const { id, position, subtype } = partDefinition;
    const bodies = cannonParts[subtype].map((section) => {
        const { material } = section;
        const shape = new CANNON.Trimesh(section.verts, section.faces);
        const [x, y, z] = position;
        const body = new CANNON.Body({
            mass: 0,
            shape,
            type: partDefinition.animation ? CANNON.Body.KINEMATIC : undefined,
            position: new CANNON.Vec3(x, y, z),
        });
        if (partDefinition.rotation) {
            body.quaternion = new CANNON.Quaternion(...partDefinition.rotation);
        }
        const { grassPhysicsMaterial, woodPhysicsMaterial, dumperPhysicsMaterial } = world_1.getMaterials();
        const materials = {
            grass: grassPhysicsMaterial,
            wood: woodPhysicsMaterial,
            dumper: dumperPhysicsMaterial,
            default: grassPhysicsMaterial
        };
        body.material = materials[material] || materials.default;
        if (material === "wood") {
            body.angularDamping = 0.9; //TODO review if this has some effect, I was trying to avoid ball to go up after restitution with high impulse on corner-2walls
        }
        else if (material === "grass") {
            body.angularDamping = 0.1;
        }
        else if (material === "dumper") {
            body.angularDamping = 0.9;
        }
        world.addBody(body);
        return body;
    });
    return {
        id: partDefinition.id,
        bodies,
        definition: partDefinition
    };
};
