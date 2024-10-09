import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();
const [,,SOURCE_NAME,TARGET_NAME] = process.argv;

//TODO find all courses
(async ()=>{
    console.log("Fetching courses")
    const courses = await prisma.courses.findMany({
        where:{
            createdBy:"admin-editor"
        }
    });
    let i = courses.length;
    console.log("fixing courses", i);
    while(i--){
        const currentCourse = courses[i];
        console.log("fixing course", currentCourse.alias)
        await prisma.courses.update({
            where:{ID:currentCourse.ID},
            data:{
                definition:currentCourse.definition.replace(/basic_/g, "egypt_" )
            }
        });
        const courseModification = await prisma.course_modification.findFirst({where:{course_ID:currentCourse.ID}});
        if(courseModification){
            await prisma.course_modification.update({
                where:{ID:courseModification.ID},
                data:{
                    definition:courseModification.definition.replace(/basic_/g, "egypt_" )
                }
            })
        }
    }
    console.log("FINISHED");
    process.exit();
})();

