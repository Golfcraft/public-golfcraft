var util = require("util");
var promisify = util.promisify;
var fs = require("fs");
(async()=>{
    const res = await promisify(fs.readdir)(".");
    const gltfFiles = res.filter(i => /\.gltf$/.test(i));
    var i = gltfFiles.length;
    while(i--){
        await promisify(fs.appendFile)(gltfFiles[i], " ", "utf8");
    }
})();

