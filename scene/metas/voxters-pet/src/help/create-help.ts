import {decode, propertySizes} from "../lib/decoder";

const texture = new Texture(`metas/voxters-pet/images/help.png`, {samplingMode:0, hasAlpha:true});
const mat = new Material();
mat.albedoTexture = texture;
//mat.alphaTexture = texture;
mat.specularIntensity = 0;
mat.roughness = 0;
mat.emissiveTexture = texture;
mat.emissiveIntensity = 1;
mat.emissiveColor = new Color3(1,1,1);

export function createHelp(name:string, x:number, y:number, z:number, _definition:number = 1) {
    console.log("createHelp")
    const callbacks:any = {
        onClick:null
    };
    const definition = _definition-1;
    const container = new Entity();

    const containerTransform = new Transform({
        position:new Vector3(x,y,z)
    });
    container.addComponent(containerTransform);
    const label = new Entity();
    const labelText = new TextShape();
    label.addComponent(labelText);
    labelText.value = name;
    labelText.fontSize = 2;
    labelText.outlineColor = Color3.Black();
    labelText.outlineWidth = 0.2;
    labelText.font = new Font(Fonts.SanFrancisco_Heavy);
    labelText.billboard = true;
    labelText.color = Color3.White();

    label.addComponent(new Transform({position:new Vector3(-1,0,-0.5)}))
    engine.addEntity(container);
    const wrapper = new Entity();
    wrapper.setParent(container);
    label.setParent(wrapper);
    wrapper.addComponent(new Transform({
        rotation:Quaternion.Euler(0,0,-90),
        scale:new Vector3(.5,.5,.5)
    }))
    const boxEntity = new Entity();
    boxEntity.setParent(wrapper);

    const box = new PlaneShape();

    box.withCollisions = true;
    boxEntity.addComponent(mat);
    boxEntity.addComponent(box);

    const topPlane = new PlaneShape();
    const topEntity = new Entity;
    topEntity.addComponent(topPlane);
    topEntity.addComponent(mat)
    topEntity.setParent(wrapper);
    topEntity.addComponent(new Transform({
        rotation:Quaternion.Euler(0,90,0),
        position:new Vector3(-0.5,0,-0.5)
    }));


    const bottomEntity = new Entity();
    bottomEntity.setParent(wrapper);
    bottomEntity.addComponent(mat);
    const bottomPlane = new PlaneShape();

    bottomEntity.addComponent(bottomPlane);
    bottomEntity.addComponent(new Transform({
        rotation:Quaternion.Euler(0,90,0),
        position:new Vector3(0.5,0,-0.5)
    }))

    let i = 8;

    const sidePlane = new PlaneShape();

    while(i--){
        const leftEntity = new Entity();
        const rightEntity = new Entity();
        rightEntity.addComponent(mat);
        leftEntity.addComponent(mat);
        leftEntity.addComponent(new Transform({
            rotation:Quaternion.Euler(90,90,90),
            position:new Vector3(-0,0.5,i*(1/(128/16))-1 +(1 / (128/8))),
            scale:new Vector3(1,1/(128/16),1)
        }))
        rightEntity.addComponent(new Transform({
            rotation:Quaternion.Euler(90,90,90),
            position:new Vector3(-0,-0.5,i*(1/(128/16))-1 +(1 / (128/8))),
            scale:new Vector3(1,1/(128/16),1)
        }));
        leftEntity.setParent(wrapper);
        rightEntity.setParent(wrapper);
        rightEntity.addComponent(sidePlane);
        leftEntity.addComponent(sidePlane);
        const backEntity = new Entity();
        backEntity.setParent(wrapper);
        backEntity.addComponent(mat);
        backEntity.addComponent(sidePlane);
        backEntity.addComponent(new Transform({
            rotation:Quaternion.Euler(0,0,0),
            position:new Vector3(-0,i*(1/(128/16))-0.5 +(1 / (128/8)),-1),
            scale:new Vector3(1,1/(128/16),1)
        }));
    }
    applyDnaUvs(_definition -1);

    let hasClick = false;

    return {
        onClick:(fn:any)=>{
            if(!hasClick){
                hasClick = true;
                const entity = new Entity();
                const box =new BoxShape();
                box.withCollisions = false;
                box.isPointerBlocker = true;
                entity.addComponent(box);
                const material = new Material();
                entity.addComponent(material);
                entity.addComponent(new Transform({
                    position: new Vector3(1,1,0),
                    scale:new Vector3(4.5,3,0.5)
                }))
                material.albedoColor = new Color4(1,0,0,0);
                entity.setParent(container);

                entity.addComponent(new OnPointerDown(({buttonId, origin, direction, hit})=>{
                    callbacks.onClick && callbacks.onClick(buttonId);
                }, {hoverText:"CLICK: switch E: change collection"}));
            }
            callbacks.onClick = fn;
        },
        applyDna:(_dna:any)=>{
            applyDnaUvs(_dna -1);
        },
        getEntity:()=>container,
        setPosition:(position:Vector3)=>{
            container.getComponent(Transform).position.copyFrom(position)
        },
        getPosition:()=>container.getComponent(Transform).position.clone(),
        dispose:()=>{
            container.setParent(null);
            engine.removeEntity(container);

        },
        lookAt:(target:Vector3)=>{
            container.getComponent(Transform).lookAt(target);
        },
        update:(dt:number)=>{

        },
        hide:()=>{
            container.setParent(null);
            engine.removeEntity(container);
        },
        show:()=>{
            engine.addEntity(container);
        }
    };
    function applyDnaUvs(dna:number){
        box.uvs = getUvsFromSprite({
            spriteDefinition:{
                spriteSheetWidth: 1024, spriteSheetHeight:1024,
                x:Math.floor(dna%8) * 128,y:Math.floor(dna/8) * 128,w:112,h:112
            }, back:1
        });
        sidePlane.uvs = getUvsFromSprite({
            spriteDefinition:{
                spriteSheetWidth: 1024, spriteSheetHeight:1024,
                x:(Math.floor(dna%8) * 128) + (128-16),
                y:Math.floor(dna/8) * 128,w:16,h:112
            },
            back:1
        });
        bottomPlane.uvs = getUvsFromSprite({
            spriteDefinition:{
                spriteSheetWidth: 1024, spriteSheetHeight:1024,
                x:Math.floor(dna%8) * 128,y:Math.floor(dna/8) * 128 + 111, w:112, h:1
            },
            back:1
        });
        topPlane.uvs = getUvsFromSprite({
            spriteDefinition:{
                spriteSheetWidth: 1024, spriteSheetHeight:1024,
                x:Math.floor(dna%8) * 128,y:Math.floor(dna/8) * 128,w:112,h:1
            },
            back:1
        });
    }
}


enum UVS_BACK {
    INVISIBLE, SAME, MIRROR
}
function getUvsFromSprite({spriteDefinition, back = UVS_BACK.INVISIBLE}:any) {
    const {spriteSheetWidth, spriteSheetHeight, x, y, w, h} = spriteDefinition;
    const X1 = x / spriteSheetWidth;
    const X2 = (x / spriteSheetWidth + w / spriteSheetWidth);
    const Y1 = 1 - (y / spriteSheetHeight);
    const Y2 = 1 - (y / spriteSheetHeight + h / spriteSheetHeight);
    const FRONT_UVS = [
        X1, Y2, //A
        X1, Y1, //B
        X2, Y1, //C
        X2, Y2 //D
    ]
    const BACK_UVS = back === 0
        ? [0, 0, 0, 0, 0, 0, 0, 0]
        : back === 1
            ? FRONT_UVS
            : [
                X2, Y2,
                X2, Y1,
                X1, Y1,
                X1, Y2
            ]

    return [
        ...FRONT_UVS,
        ...BACK_UVS
    ];
}