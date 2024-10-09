let canvas;
export const getCanvas = ()=> {
    canvas = canvas ||  new UICanvas();
    return canvas;
};