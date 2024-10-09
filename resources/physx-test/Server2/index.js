const PhysX = require('./physx-js-webidl.wasm.js')

PhysX().then(function(PhysX) {
    console.log('PhysX loaded');
});
