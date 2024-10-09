import { Widget, ImageSize } from "./widgets"
import { TextPanelData, WidgetTextPanel } from "./widgetTextPanel";

//wg de Imagen con información, se le puede añadir la funcion onClick
export type WGIconInfo = {
    imageURL?: string
    imageSize?: ImageSize
    imageScale?: ImageSize | number
    vAlign?: string
    hAlign?: string
    bVisible?: boolean
    onClickFunction?: () => void
}
//wg type listado de info
export type WGIconListInfo = {
  vAlign?: string
  hAlign?: string
  positionX?: number
  positionY?: number
  spacing?: number
  stackOrientation?: UIStackOrientation
  bVisible?: boolean
  bDebug?: boolean
}
//Constructor de wg dentro de WGIconList
export class WGIconList extends Widget{
  childrenWidget: WGIcon[]
  constructor(
      parentUI: Widget | UIShape,
      listInfo: WGIconListInfo = { }
  ){
    var parent: UIShape;
    if (parentUI as Widget) {
      parent = (parentUI as Widget).container
    }
    else if(parentUI as UIShape){
      parent = (parentUI as UIShape)
    }
    //Condiciones de posicionamiento para el texto
    if (!listInfo.vAlign) listInfo.vAlign = 'center'
    if (!listInfo.hAlign) listInfo.hAlign = 'left'
    if (!listInfo.positionX) listInfo.positionX = 1
    if (!listInfo.positionY) listInfo.positionY = 25
    if (!listInfo.spacing) listInfo.spacing = 6
    if (!listInfo.stackOrientation) listInfo.stackOrientation = UIStackOrientation.VERTICAL

    //Creación contenedor de texto
    var container = new UIContainerStack(parent)
    container.stackOrientation = listInfo.stackOrientation
    container.spacing = listInfo.spacing
    //Posicionamiento
    container.vAlign = listInfo.vAlign
    container.hAlign = listInfo.hAlign
    container.positionX = listInfo.positionX+'%'
    container.positionY = listInfo.positionY+'%'
    //Tamaño adaptativo Verdadero/Falso
    container.adaptHeight = false
    container.adaptWidth = false
    super(parentUI, container)
    this.childrenWidget = []
    //Control visibilidad del texto
    if (listInfo.bVisible) {
      this.show(true)
    }
    //Control visibilidad del contenedor del texto y modificacion de su color
    if (listInfo.bDebug) {
      container.visible = true
      container.color = new Color4(0.8,0.8,0.8,0.5)
    }
    
  }
  //Creacion de Icono
  createIcon(iconInfo?: WGIconInfo){
    const icon = new WGIcon(this, iconInfo)
    this.childrenWidget.push(icon)
  }
  //Creacion de icono con URL
  createIconURL(url: string, iconInfo?: WGIconInfo){
    if(!iconInfo) { iconInfo = {} }
    iconInfo.onClickFunction = function() {
      openExternalURL(url)
    }
    this.createIcon(iconInfo)
  }
  //Creacion de boton clickeable que abre otro wg de tipo: Widget, WGIconInfo, TextPanelData
  createIconShowWG(wg: Widget, iconInfo?: WGIconInfo, panelData?: TextPanelData){
    if(!iconInfo) { iconInfo = {} }
    iconInfo.onClickFunction = function() {
      if (panelData) {
        try {
          (wg as WidgetTextPanel).setPanelData(panelData)
        } catch (error) {}
      }
      wg.show(!wg.container.visible)
    }
    this.createIcon(iconInfo)
  }
}
//Widget de Iconos
export class WGIcon extends Widget{
  imageURL: string
  image: UIImage
  clickFuntion: ()=>void
  constructor(
      parentUI: Widget | UIShape,
      iconInfo: WGIconInfo = { }
  ){
    var parent: UIShape;
    if (parentUI as Widget) {
      parent = (parentUI as Widget).container
    }
    else if(parentUI as UIShape){
      parent = (parentUI as UIShape)
    }
    //Control propiedades icono
    if (!iconInfo.imageURL) iconInfo.imageURL = "assets/UI_Icon_Info.png"
    if (!iconInfo.imageSize) iconInfo.imageSize = {x: 225, y:225}
    if (!iconInfo.vAlign) iconInfo.vAlign = 'center'
    if (!iconInfo.hAlign) iconInfo.vAlign = 'center'

    if (!iconInfo.imageScale) {
      iconInfo.imageScale = {x: 1, y:1}
    }
    else if(typeof iconInfo.imageScale == "number"){
      iconInfo.imageScale = {x: iconInfo.imageScale, y: iconInfo.imageScale}
    }
    //Creacion de nueva imagen y escalado
    const image = new UIImage(parent, new Texture(iconInfo.imageURL))
    image.sourceWidth = iconInfo.imageSize.x
    image.sourceHeight = iconInfo.imageSize.y
    //Edicion tamaño de imagen anchura/altura
    image.width = image.sourceWidth*iconInfo.imageScale.x+'px'
    image.height = image.sourceHeight*iconInfo.imageScale.y+'px'
    //Edicion alineacion vertical/horizontal (Posicion)
    image.vAlign = iconInfo.vAlign
    image.hAlign = iconInfo.hAlign

    super(parentUI, image)
    this.image = image
    //Si tiene funcion onclick, hace visible inforacion.  
    if (iconInfo.onClickFunction) { this.setClickEvent(iconInfo.onClickFunction) }
    image.visible = (iconInfo.bVisible == true)
  
  }
  //Añade funcion al hacer click
  setClickEvent(clickFuntion:() => void){
    this.image.isPointerBlocker = true
    this.clickFuntion = clickFuntion
    this.image.onClick = new OnClick (()=>{
      clickFuntion()
    })
  }
  //Desacactiva la funcion al hacer click
  removeClickEvent(){
    if (this.image.onClick) {
      this.image.isPointerBlocker = false
      this.image.onClick = null
    }
  }
}