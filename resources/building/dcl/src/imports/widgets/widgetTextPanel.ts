import { Widget } from "./widgets"

//Type panel de textos (Titulo?, Cabecera?, TextoCentral?, Pie de pagina?)
export type TextPanelData = {
  titleText?: string
  headerText?: string
  contentText?: string
  bottomText?: string
}

//Propiedades wg panel de textos
export class WidgetTextPanel extends Widget{
    container: UIImage
    panelContainer: UIContainerRect
    titleText: UIText
    bottomText: UIText
    headerText: UIText
    contentText: UIText
    contentTextScroll: UIText
    contentScroll: UIScrollRect
    contentContainer: UIContainerRect
    imageClick: UIImage
    constructor(parentUI: Widget | UIShape){
      var parent: UIShape;
      if (parentUI as Widget) {
        parent = (parentUI as Widget).container
      }
      else if(parentUI as UIShape){
        parent = (parentUI as UIShape)
      }

      //Propiedades imagen click desactivada por defecto
      var imageClick = new UIImage(parent, new Texture(""))
      imageClick.visible = false
      imageClick.sourceHeight = 500
      imageClick.sourceWidth = 500
      imageClick.width = "200%"
      imageClick.height = "200%"
      imageClick.vAlign = 'center'
      imageClick.hAlign = 'center'
      imageClick.opacity = 0
      imageClick.onClick = new OnClick(()=>{
        this.show(false)
      })
      
      //Propieadades imagen desactivada por defecto
      var image = new UIImage(parent, new Texture("assets/UI_Land_Description_01.png"))
      image.visible = false
      image.sourceWidth = 665
      image.sourceHeight = 1000
      image.width = image.sourceWidth*0.6+'px'
      image.height = image.sourceHeight*0.6+'px'
      image.vAlign = 'center'
      image.hAlign = 'center'

      super(parentUI, image)
  

      this.imageClick = imageClick

      //Propiedades contenedor container
      this.panelContainer = new UIContainerRect(image)
      this.panelContainer.visible = true
      this.panelContainer.vAlign = 'center'
      this.panelContainer.hAlign = 'center'
      this.panelContainer.width = "100%"
      this.panelContainer.height = "100%"
      //this.panelContainer.color = new Color4(0,0,0,0.5)
      this.panelContainer.adaptHeight = false
      this.panelContainer.adaptWidth = false
      
      //Propiedades titulo del container
      let titleContainer = new UIContainerRect(this.panelContainer)
      titleContainer.positionY = "-2.5%"
      titleContainer.vAlign = 'top'
      titleContainer.hAlign = 'center'
      titleContainer.width = "80%"
      titleContainer.height = "8%"
      //titleContainer.color = new Color4(0,1,0,0.5)
      titleContainer.adaptHeight = false
      titleContainer.adaptWidth = false

      //Propiedades del texto del container
      this.titleText = new UIText(titleContainer)
      this.titleText.hTextAlign = 'center'
      this.titleText.vTextAlign = 'center'
      this.titleText.height = "98%"
      this.titleText.width = "92%"
      this.titleText.color = Color4.White()
      this.titleText.textWrapping = true

      //Propiedades caja del contenedor
      this.contentContainer = new UIContainerRect(this.panelContainer)
      this.contentContainer.positionY = "-2.5%"
      this.contentContainer.positionX = "1%"
      this.contentContainer.vAlign = 'center'
      this.contentContainer.hAlign = 'center'
      this.contentContainer.width = "85%"
      this.contentContainer.height = "69%"
      //this.contentContainer.color = new Color4(0,0,1,0.5)
      this.contentContainer.adaptHeight = false
      this.contentContainer.adaptWidth = false
      
      //Propiedades scrol container
      this.contentScroll = new UIScrollRect(this.contentContainer)
      this.contentScroll.vAlign = 'center'
      this.contentScroll.hAlign = 'center'
      this.contentScroll.width = "100%"
      this.contentScroll.height = "100%"
      this.contentScroll.isVertical = true
  
      this.contentTextScroll = new UIText(this.contentScroll)
      this.contentTextScroll.vAlign = 'top'
      this.contentTextScroll.hAlign = 'center'
      this.contentTextScroll.hTextAlign = 'left'
      this.contentTextScroll.vTextAlign = 'top'
      this.contentTextScroll.height = "100%"
      this.contentTextScroll.width = "88%"
      this.contentTextScroll.color = Color4.Black()
      this.contentTextScroll.fontSize = 14
      this.contentTextScroll.textWrapping = true
      this.contentTextScroll.adaptHeight = true

      this.contentText = new UIText(this.contentContainer)
      this.contentText.vAlign = 'top'
      this.contentText.hAlign = 'center'
      this.contentText.hTextAlign = 'left'
      this.contentText.vTextAlign = 'top'
      this.contentText.height = "100%"
      this.contentText.width = "88%"
      this.contentText.color = Color4.Black()
      this.contentText.fontSize = 14
      this.contentText.textWrapping = true
      this.contentText.adaptHeight = true

      //Propiedades contenedor de cabecera
      let headerContainer = new UIContainerRect(this.panelContainer)
      headerContainer.positionY = "-11%"
      //headerContainer.positionX = "4.5%"
      headerContainer.vAlign = 'top'
      headerContainer.hAlign = 'center'
      headerContainer.width = "83%"
      headerContainer.height = "7%"
      //headerContainer.color = new Color4(1,0,0,0.5)
      headerContainer.adaptHeight = false
      headerContainer.adaptWidth = false

      this.headerText = new UIText(headerContainer)
      this.headerText.hTextAlign = 'left'
      this.headerText.vTextAlign = 'center'
      this.headerText.height = "50%"
      this.headerText.width = "90%"
      this.headerText.color = Color4.Black()
      this.headerText.value = "HEADER TEXT"
      this.headerText.textWrapping = true
      this.headerText.fontAutoSize = true

      //Propiedades contenedor inferior
      let bottomContainer = new UIContainerRect(this.panelContainer)
      bottomContainer.positionY = "6%"
      bottomContainer.positionX = "1%"
      bottomContainer.vAlign = 'bottom'
      bottomContainer.hAlign = 'center'
      bottomContainer.width = "74%"
      bottomContainer.height = "7%"
      //bottomContainer.color = new Color4(0.5,1,0.5,0.2)
      bottomContainer.adaptHeight = false
      bottomContainer.adaptWidth = false

      this.bottomText = new UIText(bottomContainer)
      this.bottomText.hTextAlign = 'left'
      this.bottomText.vTextAlign = 'center'
      this.bottomText.height = "50%"
      this.bottomText.width = "90%"
      this.bottomText.color = Color4.Black()
      this.bottomText.value = "Bottom text"
      this.bottomText.textWrapping = true
      this.bottomText.fontAutoSize = true

    }
    //Hace visible el TextPanel
    show(bVisible: boolean){
      super.show(bVisible)
      this.imageClick.visible = bVisible
    }
    //Actualiza los datos que tendra el Text Panel (textos): titulo, cabecera, contenido y/o pie de pagina
    setPanelData(data: TextPanelData){
      if (data.titleText !== undefined) this.updateTitleText(data.titleText)
      if (data.headerText !== undefined) this.updateHeaderText(data.headerText)
      if (data.contentText !== undefined) this.updateContentText(data.contentText)
      if (data.bottomText !== undefined) this.updateBottomText(data.bottomText)

    }
    private updateTitleText(value: string){
      this.titleText.value = value
      var alpha = clamp((this.titleText.value.length-20)/20, 0, 1)
      this.titleText.fontSize = lerp(25,12,alpha)
    }
    private updateContentText(value: string){
      if (value.length>920) {
        this.contentText.value = ""
        this.contentText.visible = false
        this.contentTextScroll.value = value
        this.contentTextScroll.visible = true
        this.contentScroll.visible = true
      }
      else{
        this.contentScroll.visible = false
        this.contentTextScroll.value = ""
        this.contentTextScroll.visible = false
        this.contentText.value = value
        this.contentText.visible = true
      }
      
    }
    private updateBottomText(value: string){
      this.bottomText.value = value
    }
    private updateHeaderText(value: string){
      this.headerText.value = value
    }
  }