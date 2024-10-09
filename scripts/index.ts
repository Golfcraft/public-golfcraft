require("dotenv").config();

const myArgs = process.argv.slice(2);
const command = myArgs[0];
if(!command){
    console.log("missing command");
}

import(`./scripts/${command}.ts`).then((module)=>{
    const scriptFn = module.default;
    scriptFn(myArgs.slice(1))
})


