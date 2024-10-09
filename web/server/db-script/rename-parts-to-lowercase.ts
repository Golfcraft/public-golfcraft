import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();


//TODO find all courses
(async ()=>{
    console.log("Fetching courses")
    const courses = await prisma.courses.findMany({
        where:{
        //    createdBy:"admin-editor"
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
                definition:currentCourse.definition.toLowerCase()
                    .replace(/part1/g,"Part1")
                    .replace(/part2/g,"Part2")
                    .replace(/part6/g,"Part6")
                    .replace(/skybox1/g,"Skybox1")
                    .replace(/start1/g,"Start1")
                    .replace(/end1/g,"End1")
            }
        });
        const courseModification = await prisma.course_modification.findFirst({where:{course_ID:currentCourse.ID}});
        if(courseModification){
            await prisma.course_modification.update({
                where:{ID:courseModification.ID},
                data:{
                    definition:courseModification.definition.toLowerCase()
                        .replace(/part1/g,"Part1")
                        .replace(/part2/g,"Part2")
                        .replace(/part6/g,"Part6")
                        .replace(/skybox1/g,"Skybox1")
                        .replace(/start1/g,"Start1")
                        .replace(/end1/g,"End1")
                }
            })
        }
    }
    console.log("FINISHED");
    process.exit();
})();

