import {createTextShapeTable} from '../lib/TextShapeTable';
import { createCaptcha } from '../lib/captcha';

const scene = new Entity();
engine.addEntity(scene);
const boxEntity = new Entity();
boxEntity.addComponent(new Transform({
  scale: new Vector3(4,2,1),
  position: new Vector3(8+2,0+1,8 + (1/2+0.0001))
}));
boxEntity.addComponent(new BoxShape());
boxEntity.setParent(scene);
const data = (new Array(10)).fill(null).map((a,i)=>[`${(Number(i)+1).toString()}.- mmmmmmmmmm`, Math.floor(Math.random()*99999)]);
/* const data = [
  [
      "0.- DrThundercock",
      "12"
  ],
  [
      "1.- 68479F2D17ADA974",
      "11"
  ],
  [
      "2.- AB34FF23F2280A65",
      "10"
  ],
  [
      "3.- pablo",
      "2"
  ],
  [
      "4.- pablo2#4e29",
      "2"
  ]
]; */
createTextShapeTable(scene, scene, {
  entity:{
    position: new Vector3(8,2,8)
  },
  minWidth:4,
  text:{ fontSize:2, font:Fonts.LiberationSans },
  data,
  columns:[{
    width:2,    
    text: { hTextAlign: "left", color: Color3.Red() }
  },
  {
    width:1,
    text: { hTextAlign: "right", color: Color3.Blue() }
  }]
});
const imageId = 6;
let imageSrc = 'https://mana-fever.com/captcha-get-image/'+ imageId;
imageSrc = "images/text2.jpeg";
const captcha = createCaptcha({
  imageSrc,
  onSubmit:(value:string)=>{
    console.log("submit", value)
  }
});

//captcha.hide(); 
//createCaptcha({imageSrc:'https://www.pngegg.com/public/css/top.png'});

const entity = new Entity();
const shape = new PlaneShape();
const texture = new Texture(imageSrc);
const material = new Material();
material.albedoTexture = texture;
entity.addComponent(new Transform({
  position:new Vector3(8,2,8)
}))
entity.addComponent(new OnPointerDown(()=>{}))
entity.addComponent(shape);
entity.addComponent(material);
engine.addEntity(entity);