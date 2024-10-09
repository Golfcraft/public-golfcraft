import Jimp from "jimp";
import {promisify} from "util";
import path from "path";
const textImageCache = new Map();

export const textImageApi = async (router) => {
    console.log("RESOLVE", path.resolve(__dirname,"foo"), )
    const fonts = {
        "test":await Jimp.loadFont(path.resolve(__dirname,"test.fnt")),
        "Teko-SemiBold":await Jimp.loadFont(path.resolve(__dirname, "Teko-SemiBold.fnt")),
    }
    const DEFAULT_FONT_KEY = "test";
    router.get('/api/text-image-preview', async (req, res) => {
        return res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Title</title>
        </head>
        <body>
            <img src="/api/text-image?${req.url.replace(req.route.path+"?","")}" style="outline: 1px solid red;" />
        </body>
        </html>
    `)
    });
    router.get('/api/text-image', async (req, res) => {
        const {
            textWidth = 100, text = "text", c=0,
            font="test", imageWidth = 1024, imageHeight = 768,
            crop=false, background="0xffffff00", x=0,y=0
        } = req.query;
        const sumNumbers = textWidth + imageWidth + imageHeight;
        if(!text){
            return res.status(500).send({error:"MISSING TEXT"});
        }
        const cacheKey = `${sumNumbers||"0"}_${font||"0"}_${text}_${background}_${crop}`;
        const bufferCache = textImageCache.get(cacheKey);
        if(bufferCache){
            res.attachment("filename.png");
            return res.send(bufferCache);
        }
        // @ts-ignore
        const image:any = await promisify(createJimp)(imageWidth,imageHeight,Number(background));
        image.print(
            fonts[font || DEFAULT_FONT_KEY],
            Number(x), Number(y),
            text || "X_X",
            textWidth && Number(textWidth) || undefined
        );
        if(crop){
            image.autocrop();
        }
        const buffer = await promisify(image.getBuffer.bind(image))(Jimp.MIME_PNG);
        res.attachment("filename.png");
        if(c){
            textImageCache.set(cacheKey, buffer);
        }
        return res.send(buffer);
    });
}

function createJimp(width,height, background?, cb?):any {
    return  background
        ? (new Jimp(width, height, background, cb))
        : (new Jimp(width, height, cb));
}