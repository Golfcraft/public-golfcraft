
//TODO list maps from ts file
//TODO list maps from remote database
import * as fs from "fs";
import {courseDefinitionsRepo, getCourseDefinition} from "../../common/course-definitions/course-definition-repository";

const fileRepoList = new Set([
    ...Object.keys(courseDefinitionsRepo.training["1"]),
    ...Object.keys(courseDefinitionsRepo.training["2"]),
    ...Object.keys(courseDefinitionsRepo.training["3"]),
    ...Object.keys(courseDefinitionsRepo.training["4"]),
    ...Object.keys(courseDefinitionsRepo.competition["1"]),
]);
export default (args) => {
    const mapsWithMagnets = Array.from(fileRepoList).filter(alias => {
        const map = courseDefinitionsRepo.training["1"][alias]
        || courseDefinitionsRepo.training["2"][alias]
            || courseDefinitionsRepo.training["3"][alias]
            || courseDefinitionsRepo.training["4"][alias]
            || courseDefinitionsRepo.competition["1"][alias];
        const hasMagnet = map.parts.find(p=>p.type === "magnet" || p.subtype==="Magnet");
        if(hasMagnet){
            return true;
        }
    });
    const repoPath = "../common/course-definitions/course-definition-repository.ts";
    let repoFileContent = fs.readFileSync(repoPath, "utf8");
    mapsWithMagnets.forEach((alias)=>{

        const regexp = new RegExp(`"${alias}"`,"g");
        console.log("replacing",alias, regexp.test(repoFileContent))
        repoFileContent = repoFileContent.replace(regexp, `//TODO MAGNET "${alias}"`);
    });
    fs.writeFileSync(repoPath, repoFileContent, "utf8");
    console.log("DONE!");
}
