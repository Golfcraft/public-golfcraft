import { delay } from "./delay"

type StreamVideoConstruct = {
  url: string, 
  hoverPlay?: string
  hoverPause?: string
  bLoop?: boolean
  volume?: number
  bPlay?: boolean
  bLateRestart?: boolean
  imageUrl?: string
  bTumbnailOnPause?: boolean
}

type StreamVideoInfo = {
  url: string,
  image: string,
  material: Material, 
  videoTexture: VideoTexture,
  imageMaterial: Material,
  imageTexture?: Texture,
  emptyTexture?: Texture
  // StreamVideoComponents?: StreamVideo[]
}

const videoTextureArray: StreamVideoInfo[] = []

function getVideoTexture(url: string){
  for (let i = 0; i < videoTextureArray.length; i++) {
    if (videoTextureArray[i].url==url) {
      return videoTextureArray[i]
    }
  }
  return null
}

function addVideoTexture(url: string, image: string = ""){
  const StreamVideoClip = new VideoClip(url)
  const texture = new VideoTexture(StreamVideoClip)
  const mat = new Material()

  var imageMaterial: Material
  var imageTexture: Texture  
  if(image){
    imageMaterial = new Material()
    imageTexture = new Texture(image)
    imageMaterial.albedoTexture = imageTexture
  }
  
  mat.albedoTexture = texture
  mat.roughness = 1
  videoTextureArray.push({
    url: url,
    image: image,
    material: mat, 
    imageMaterial: imageMaterial,
    videoTexture: texture,
    imageTexture: imageTexture,
    // StreamVideoComponents: []
  })
  return videoTextureArray[videoTextureArray.length-1]
}


@Component("StreamVideo")
export class StreamVideo{
    entity: Entity
    entityImage: Entity
    StreamVideoInfo: StreamVideoInfo
    pointerDownEvent: OnPointerDown
    volumen: number
    bLoop: boolean
    hoverPlay: string
    hoverPause: string
    bPlaying: boolean
    bVisibleThumbnail: boolean
    bTumbnailOnPause: boolean
    constructor(entity: Entity, data: StreamVideoConstruct){
        this.entity = entity
        if (data.volume === undefined || data.volume === null ) data.volume = 5;
        if (data.hoverPlay === undefined || data.hoverPlay === null ) data.hoverPlay = "Play";
        if (data.hoverPause === undefined || data.hoverPause === null ) data.hoverPause = "Pause";

        this.volumen = data.volume
        this.bLoop = data.bLoop
        this.hoverPlay = data.hoverPlay
        this.hoverPause = data.hoverPause
        this.bTumbnailOnPause = data.bTumbnailOnPause == true
        this.StreamVideoInfo = getVideoTexture(data.url)

        if(!this.StreamVideoInfo){
          this.StreamVideoInfo = addVideoTexture(data.url,data.imageUrl)          
        }
        // this.StreamVideoInfo.StreamVideoComponents.push(this)

        if (!entity.hasComponent(PlaneShape) && !entity.hasComponent(BoxShape) && !entity.hasComponent(GLTFShape)) {
            entity.addComponent(new PlaneShape())
        }

        entity.addComponentOrReplace(this.StreamVideoInfo.material)

        this.setLoop(this.bLoop)
        var self = this
        this.pointerDownEvent = new OnPointerDown(
          () => {
            self.play(!self.bPlaying)
          },
          {
            hoverText: this.hoverPlay
          }
        )
        entity.addComponent(this.pointerDownEvent)

        if(data.imageUrl){
          this.entityImage = new Entity()
          this.entityImage.addComponent(new PlaneShape())
          this.entityImage.getComponent(PlaneShape).withCollisions = true
          this.entityImage.addComponent(new Transform({scale: new Vector3(1,-1,1)}))
          this.entityImage.addComponent(this.StreamVideoInfo.imageMaterial)
          this.entityImage.addComponent(new OnPointerDown(
            () => {
              self.play(!self.bPlaying)
            },
            {
              hoverText: this.hoverPlay
            }
          ))
          this.entityImage.setParent(this.entity)
          this.showThumbnail(true)
        }

        this.setVolumen(this.volumen)
        this.play(data.bPlay)
        if (data.bPlay && data.bLateRestart) {
          this.lateRestart()
        }
        //console_log("Numero de texturas en stream: ", videoTextureArray.length)
        
    }
    lateRestart(waitSeconds: number = 20){
      var self = this
      delay(() => {
        self.play(false)
        delay(() => {
          self.play(true)
        }, 1000);
      }, waitSeconds*1000);
    }
    showThumbnail(bShow: boolean = false){
      if (!this.bVisibleThumbnail && bShow) {
        this.entityImage.getComponent(PlaneShape).withCollisions = true
        this.entityImage.getComponent(PlaneShape).visible = true
        this.entity.getComponent(PlaneShape).visible = false
      }
      else if (this.bVisibleThumbnail && !bShow) {
        this.entityImage.getComponent(PlaneShape).visible = false
        this.entityImage.getComponent(PlaneShape).withCollisions = false
        this.entity.getComponent(PlaneShape).visible = true
      }
      this.bVisibleThumbnail = bShow
    }
    play(bPlay: boolean = true){ 
      if (bPlay) {
        this.StreamVideoInfo.videoTexture.playing = false
        this.StreamVideoInfo.videoTexture.playing = true
        this.pointerDownEvent.hoverText = this.hoverPause
        this.showThumbnail(false)
        
      }
      else {
        this.pointerDownEvent.hoverText = this.hoverPlay
        if (this.bTumbnailOnPause) {
          this.showThumbnail(true)
          this.StreamVideoInfo.videoTexture.playing = false
          this.StreamVideoInfo.videoTexture.playing = true
        }
        else this.StreamVideoInfo.videoTexture.playing = false
      }
      this.bPlaying = bPlay
    }
    setVolumen(volumen: number){
      this.volumen = volumen
      this.StreamVideoInfo.videoTexture.volume = volumen
    }
    setLoop(bLoop: boolean){
      this.StreamVideoInfo.videoTexture.loop = bLoop
    }
}

@Component("StreamImage")
export class StreamImage{
  entity: Entity
  url: string
  material: Material
  constructor(entity:Entity, url: string, metalic: number = 0, roughness: number = 1){
    this.entity = entity
    this.url = url
    if (!entity.hasComponent(PlaneShape) && !entity.hasComponent(BoxShape) && !entity.hasComponent(GLTFShape)) {
      entity.addComponent(new PlaneShape())
    }
    const myTexture = new Texture(url)
    this.material = new Material()
    this.material.albedoTexture = myTexture
    this.material.metallic = metalic
    this.material.roughness = roughness
    entity.addComponentOrReplace(this.material)

    entity.getComponent(Transform).scale.y = -entity.getComponent(Transform).scale.y
  }
}