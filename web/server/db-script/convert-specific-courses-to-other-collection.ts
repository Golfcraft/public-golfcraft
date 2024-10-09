import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();
const OLD_COLLECTION_ID = 1;
const NEW_COLLECTION_ID = 2;
const OLD_PREFIX = "space";
const NEW_PREFIX = "urban";

const mapsToConvert = [
    "Aim 30",
    "Aim 35",
    "Amplio 25",
    "Recta 26",
    "Amplio 5",
    "Viento 5",
    "Viento 9",
    "Viento 10",
    "Viento 22",
    "Viento 36",
    "Viento 15",
    "Camino 15",
    "Viento 8",
    "Viento 25",
    "Viento 30",
    "Viento 40",
    "Viento 26",
    "Viento 31",
    "Viento 32",
    "Viento 34",
    "Viento 35",
    "Camino 19",
    "Camino 14",
    "camino 26",
    "Amplio30",
    "Equilibrio 40",
    "Amplio 27"
];

(async () => {
    for(let alias of mapsToConvert){
        const course:any = await prisma.courses.findFirst({where:{alias}});
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
        course.isSeason = 0;
        await prisma.courses.create({data:course});
    }
})();