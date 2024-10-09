import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();
const [,,SOURCE_NAME,TARGET_NAME] = process.argv;
const SOURCE_REGEXP = new RegExp(SOURCE_NAME, "g");
if(!SOURCE_NAME || !SOURCE_NAME){
    throw Error("missing args");
    process.exit();
}
//TODO find all courses
(async ()=>{
    console.log(`Renaming in definitions ${SOURCE_NAME} to ${TARGET_NAME}`)
    console.log("Fetching courses")
    const courses = await prisma.courses.findMany();
    let i = courses.length;
    console.log("fixing courses", i);
    while(i--){
        const currentCourse = courses[i];
        if(~currentCourse.definition.indexOf(SOURCE_NAME)){
            console.log("fixing course", currentCourse.alias)
            await prisma.courses.update({
                where:{ID:currentCourse.ID},
                data:{
                    definition:currentCourse.definition.replace(SOURCE_REGEXP, TARGET_NAME )
                }
            })
        }
    }
    console.log("Fetching course_modification")
    const course_modifications = await prisma.course_modification.findMany();
    i = course_modifications.length;
    console.log("fixing course_modification", i)
    while(i--){
        const currentCourse = course_modifications[i];
        if(~currentCourse.definition.indexOf(SOURCE_NAME)){
            console.log("fixing course_modification", currentCourse.alias||currentCourse.course_ID);
            await prisma.course_modification.update({
                where:{ID:currentCourse.ID},
                data:{
                    definition:currentCourse.definition.replace(SOURCE_REGEXP, TARGET_NAME )
                }
            })
        }
    }
    console.log("FINISHED");
    process.exit();
})();

