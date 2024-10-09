import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();
const [,,PART_NAME, REMOVE] = process.argv;

(async ()=>{
    const courses = await prisma.courses.findMany();
    let i = courses.length;
    const coursesWithThePartAliases = new Set();
    while(i--){
        const currentCourse = courses[i];
        const definition = JSON.parse(currentCourse.definition);
        if(definition?.parts?.find(p=>p.subtype === PART_NAME)){
            coursesWithThePartAliases.add(currentCourse.alias);
            if(REMOVE){

                console.log(`Removing ${PART_NAME} from course ${currentCourse.alias}`);
                definition.parts = definition.parts.filter(p=>p.subtype !== PART_NAME);
                await prisma.courses.update({
                    where:{ID:currentCourse.ID},
                    data:{definition:JSON.stringify(definition)}
                })

            }
        }
    }
    console.log("Courses:", Array.from(coursesWithThePartAliases));
    const courseModifications = await prisma.course_modification.findMany();
    const modificationsWithThePart = new Set();
    i = courseModifications.length;
    while(i--){
        const currentCourseModification = courseModifications[i];
        const definition = JSON.parse(currentCourseModification.definition);
        if(definition?.parts?.find(p=>p.subtype === PART_NAME)){
            const originalCourseAlias = (await prisma.courses.findFirst({where:{ID:currentCourseModification.course_ID}})).alias;
            modificationsWithThePart.add( originalCourseAlias );

            if(REMOVE){

                console.log(`Removing ${PART_NAME} from course modification  on ${originalCourseAlias}`);
                definition.parts = definition.parts.filter(p=>p.subtype !== PART_NAME);

                await prisma.course_modification.update({
                    where:{ID:currentCourseModification.ID},
                    data:{definition:JSON.stringify(definition)}
                })
            }
        }
    }

    console.log("Course modifications:", Array.from(modificationsWithThePart));



})();

