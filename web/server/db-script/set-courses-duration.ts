import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

//TODO find all courses
(async ()=>{
    console.log("Fetching courses")
    const courses = await prisma.course_modification.findMany();
    let i = courses.length;
    console.log("fixing courses", i);
    while(i--){
        const currentCourse = courses[i];
        console.log("fixing course", currentCourse.course_ID);
        const metadata = currentCourse.metadata && JSON.parse(currentCourse.metadata) || {duration:300, "GC":0,"XP":0,"minLevel":1};

            metadata.duration = 300;

           const result = await prisma.course_modification.update({
                where:{ID:currentCourse.ID},
                data:{
                    metadata:JSON.stringify(metadata)
                }
            });
           console.log("update result", result);

    }
    console.log("FINISHED");
    process.exit();
})();

