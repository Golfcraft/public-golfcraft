const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
       // headless:false,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: [`--window-size=${1366+200},${768+200}`]
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768});
    await page.goto('https://decentraland.org/play/?position=47%2C-45');
  //  await page.goto('https://decentraland.org');
  //  await page.screenshot({path: 'example.png'});
    await sleep(1000);
    const loginButton = await page.$(".LoginGuestItem");
    loginButton.click();
    await sleep(1000);
    console.log
    const ev = await page.evaluate(async ()=>{
        const canvasElement = document.getElementsByTagName("canvas")[0];
        const context = canvasElement.getContext('webgl2');

        const now = Date.now();
        await waitForPixelColor(context, 0,0,"#cfcdd4ff");

        return Date.now() - now;

        async function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        function waitForPixelColor(context, x, y, color){
            return new Promise((resolve, reject)=>{
                var interval = setInterval(()=>{
                    getPixelColor(context, x,y).then(_color => {
                        if(color === _color){
                            resolve();
                            clearInterval(interval);
                        }else{
                            console.log(_color);
                        }
                    })
                },100)
            });
        }
        function getPixelColor(context, x, y){
            var pixels = new Uint8Array(
                4 * context.drawingBufferWidth * context.drawingBufferHeight
            );

            return new Promise((resolve)=>{
                requestAnimationFrame(() => {
                    context.readPixels(
                        0,
                        0,
                        context.drawingBufferWidth,
                        context.drawingBufferHeight,
                        context.RGBA,
                        context.UNSIGNED_BYTE,
                        pixels
                    );
                    // here `pixels` has the correct data
                });
                //TODO wait for pixel[0] to have value;
                var interval = setInterval(()=>{
                    if(pixels[0]){
                        var pixelR = pixels[4 * (y * context.drawingBufferWidth + x)];
                        var pixelG = pixels[4 * (y * context.drawingBufferWidth + x) + 1];
                        var pixelB = pixels[4 * (y * context.drawingBufferWidth + x) + 2];
                        var pixelA = pixels[4 * (y * context.drawingBufferWidth + x) + 3];
                        clearInterval(interval);
                        resolve(rgba2hex([pixelR,pixelG,pixelB,pixelA]))
                    }
                },100);
            })
        }
        function rgba2hex(rgb) {
            var a = rgb[3],
                hex =
                    (rgb[0] | 1 << 8).toString(16).slice(1) +
                    (rgb[1] | 1 << 8).toString(16).slice(1) +
                    (rgb[2] | 1 << 8).toString(16).slice(1);


            // multiply before convert to HEX
            a = ((a ) | 1 << 8).toString(16).slice(1)
            hex = hex + a;

            return `#`+hex;
        }
    });
    console.log("ev",ev);
    await page.screenshot({path: 'screen0.png'});
    await sleep(10000);
    await page.screenshot({path: 'screen1.png'});
    await sleep(1000);
    await page.screenshot({path: 'screen1b.png'});
    await page.mouse.click(1241, 728);//click done avatar
    await sleep(3000);
    await page.mouse.click(744,279);
    await sleep(3000);
    await page.keyboard.type('test');

    await sleep(1000);
    await page.screenshot({path: 'screen2.png'});
    await page.mouse.click(888,527);
    await sleep(1000);
    await page.mouse.click(1134,317);//scroll click
    await page.screenshot({path: 'screen3.png'});
    console.log("click scroll");
    await sleep(50);
    await page.mouse.click(1134,466, {delay: 25000});await sleep(100);console.log("click scroll");
    await sleep(1000);
    console.log("clicks scroll done");
    await page.mouse.click(894,528);
    await page.screenshot({path: 'screen4.png'});
    await sleep(4000);
    await page.screenshot({path: 'screen5.png'});
})();

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

