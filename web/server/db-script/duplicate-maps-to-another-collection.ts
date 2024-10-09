import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();
const OLD_COLLECTION_ID = 1;
const NEW_COLLECTION_ID = 2;
const OLD_PREFIX = "space";
const NEW_PREFIX = "urban";

(async () => {
    const originalCourses = await prisma.courses.findMany({
        where: {
            isSeason: 1,
            collectionId: OLD_COLLECTION_ID
        }
    });
    const courses = JSON.parse(JSON.stringify(originalCourses))
    for(let course of courses){
        const modification = await prisma.course_modification.findFirst({where:{course_ID:course.ID}});

        if(modification){
            course.definition = modification.definition;
            course.displayName = modification.displayName || course.displayName;
        }

        course.parsedDefinition = JSON.parse(course.definition);
        course.parsedDefinition.parts.forEach(part => {
            Object.assign(part, ({
                subtype:part.subtype.replace(OLD_PREFIX, NEW_PREFIX)
            }))
        });
        course.definition = JSON.stringify(course.parsedDefinition);

        delete course.parsedDefinition;
        delete course.ID;

        course.alias = course.alias + "_" + NEW_PREFIX;
        course.displayName = course.displayName + "_" + NEW_PREFIX;
        course.collectionId = NEW_COLLECTION_ID;
        course.status = 0;
    }
    console.log("Creating courses ...");
    await prisma.courses.createMany({data:courses});
    console.log("DONE!!");
})();