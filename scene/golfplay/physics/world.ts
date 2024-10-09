import {CONTACT_BALL_GRASS_FRICTION, CONTACT_BALL_GRASS_RESTITUTION, CONTACT_BALL_WOOD_FRICTION, CONTACT_BALL_WOOD_RESTITUTION, CONTACT_BALL_DUMPER_RESTITUTION, CONTACT_BALL_DUMPER_FRICTION, WORLD_DEFAULT_FRICTION, WORLD_DEFAULT_RESTITUTION, WORLD_GRAVITY} from '../../../common/physics-config';

const materials = {
  woodPhysicsMaterial:null,
  ballPhysicsMaterial:null,
  grassPhysicsMaterial:null,
  dumperPhysicsMaterial:null
};

const initializeMaterials = () => {
  materials.grassPhysicsMaterial = new CANNON.Material("grassMaterial");
  materials.woodPhysicsMaterial = new CANNON.Material("woodMaterial");
  materials.ballPhysicsMaterial = new CANNON.Material("ballMaterial");
  materials.dumperPhysicsMaterial = new CANNON.Material("dumperMaterial");
  return materials;
};

const createPhysicsWorld = () => {
  const world = new CANNON.World();
  const {dumperPhysicsMaterial, grassPhysicsMaterial, ballPhysicsMaterial, woodPhysicsMaterial} = materials;
  const ballGrassContactMaterial = new CANNON.ContactMaterial(grassPhysicsMaterial, ballPhysicsMaterial, {
    friction: CONTACT_BALL_GRASS_FRICTION,
    restitution: CONTACT_BALL_GRASS_RESTITUTION,
  });

  const ballWoodContactMaterial = new CANNON.ContactMaterial(woodPhysicsMaterial, ballPhysicsMaterial, {
    friction: CONTACT_BALL_WOOD_FRICTION,
    restitution: CONTACT_BALL_WOOD_RESTITUTION,
  });

  const ballDumperContactMaterial = new CANNON.ContactMaterial(dumperPhysicsMaterial, ballPhysicsMaterial, {
    friction: CONTACT_BALL_DUMPER_FRICTION,
    restitution: CONTACT_BALL_DUMPER_RESTITUTION,
  });

    world.gravity.set(0, WORLD_GRAVITY, 0); // m/s²
    world.addContactMaterial(ballGrassContactMaterial);
    world.addContactMaterial(ballWoodContactMaterial);
    world.addContactMaterial(ballDumperContactMaterial);
    world.broadphase = new CANNON.SAPBroadphase(world);
   // world.solver = new CANNON.GSSolver();
   // world.solver.iterations = 100;
    //world.solver.tolerance = 0.0001;
    world.defaultContactMaterial.friction = WORLD_DEFAULT_FRICTION;
    world.defaultContactMaterial.restitution = WORLD_DEFAULT_RESTITUTION;
  //  world.quatNormalizeFast = true;
  //  world.quatNormalizeSkip = 2;
   // world.defaultContactMaterial.contactEquationStiffness = 1e11; // Contact stiffness - use to make softer/harder contacts
   // world.defaultContactMaterial.contactEquationRelaxation = 2; // Stabilization time in number of timesteps
    
    const dispose = () => {
        //TODO REVIEW:
        //world.removeContactMaterial();
    };

    return {
        world,
        dispose
    };
}

const getMaterials = () => materials;

export {
    createPhysicsWorld,
    initializeMaterials,
    getMaterials
};
