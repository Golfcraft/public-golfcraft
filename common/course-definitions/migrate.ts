const fs = require("fs");
const files = fs.readdirSync(process.cwd()).filter(filename=>!~filename.indexOf("migrate")).filter(filename=>!~filename.indexOf("course-definition-repo"));
console.log("files",files);

files.forEach(filename => {
    const content = fs.readFileSync(filename, "utf8").replace("export default ","");
    const courseDefinition = JSON.parse(content);
    const migratedCourseDefinition = migrateCourseDefinition(courseDefinition);
    if(JSON.stringify(courseDefinition) !== JSON.stringify(migratedCourseDefinition)){
        console.log("migrated", filename);
        fs.writeFileSync(filename, 'export default '+JSON.stringify(migratedCourseDefinition, null, '  '), "utf8");
    }
});

function migrateCourseDefinition(_courseDefinition){
    const courseDefinition = JSON.parse(JSON.stringify(_courseDefinition));

    if(courseDefinition.parts.find(part=>typeof part.id === "string")){
        courseDefinition.parts = courseDefinition.parts.map((part,index) => ({
            ...part,
            id:index+1,
            type: (part.id && typeof part.id === "string")? "solid" : part.type,
            subtype: part.id || part.subtype
        }));
        return courseDefinition;
    }else{
        return courseDefinition;
    }    
}