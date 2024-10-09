import { 
  Widget, WidgetTalk, setWidgetNFT, getWidgetNFT, WidgetNFT, 
  WGIconList, WGIconListInfo, WidgetTextPanel, SkipMode
} from "./imports/index"
import { textDialogs } from './jsonData/textsData'

var hud: HUD = null

export function getHUD(){
    if (!hud) {
      spawnHUD()
    }
    return hud
}

function spawnHUD(){
  hud = new HUD()
}
//Clase HUD, TODO aquello que queramos mostrar por pantalla estara aninado en esta clase
export class HUD {  
  canvas: UICanvas
  widgets: Widget[]         //Array que almacena los widget, para llamarlos indicar el indice del metodo
  wgIconList: WGIconList[]  //
  wgTalk: WidgetTalk
  wgNFT: WidgetNFT
  wgTextPanel: WidgetTextPanel
  constructor(){
    this.canvas = new UICanvas()
    this.canvas.visible = true
    //this.wgTalk = new WidgetTalk(this.canvas, 1, true, SkipMode.Click)
    setWidgetNFT(this.canvas)
    this.wgNFT = getWidgetNFT()
    this.widgets = [this.wgNFT] //Aqui añadimos los widgets que vayamos a usar, ej: si vamos a añadir un npc con dialogo, [this.wgNFT,this.wgTalk]
    this.wgIconList = []

  }
  //Seleccionar el dialogo del wgTalk, el array de texto por el que empezara la conversacion
  setWidgetDialogIndex(widget: number | WidgetTalk, newIndex: number){
    try {
      let widgetTalk: WidgetTalk
      if (typeof widget == 'number') {
        widgetTalk = this.widgets[widget] as WidgetTalk
      }
      else {
        widgetTalk = widget as WidgetTalk
      }
      widgetTalk.dialogIndex = newIndex
      widgetTalk.dialogData = textDialogs[newIndex]
      widgetTalk.textData = {
        dialogId: newIndex,
        textId: -1
      }
    } catch (error) {
      
    }
    
  }
  //Mostrar un tiempo el dialogo con el index indicado, permite ocultar otros
  showWidgetIndex(index: number, hideOthers:boolean, showForTime: number=0){
    if (hideOthers) {
      this.hideAll()
    }
    if (this.widgets[index]) {
      if(showForTime>0){
        this.widgets[index].showForTime(true, showForTime)
      }
      else {this.widgets[index].show(true)}
    }

  }
  //Ocultar los dialogos indicados
  hideWidgetIndex(index: number){
    if (this.widgets[index] && this.widgets[index].container.visible) {
      this.widgets[index].show(false);
    }
  }
  //Ocultar todo
  hideAll(){
    for (let i = 0; i < this.widgets.length; i++) {
      this.hideWidgetIndex(i)
    }
  }
  //Añadir wg al HUD
  addWidgetToHUD(wg: Widget): number{
    this.widgets.push(wg)
    return this.widgets.length-1
  }
  //Crear lista de iconos para el HUD
  createIconList(listInfo?: WGIconListInfo){
      const iconList = new WGIconList(this.canvas, listInfo)
      this.addWidgetToHUD(iconList)
      this.wgIconList.push(iconList)
      return iconList
  }
  //Crear Panel con texto 
  getWidgetTextPanel(){
    if (!this.wgTextPanel) {
      this.wgTextPanel = new WidgetTextPanel(this.canvas)
      this.widgets.push(this.wgTextPanel)
    }
    return this.wgTextPanel
  }

}


