import { createSlotPanel } from "../SlotPanel/SlotPanel";
import { TabDefinition } from "../Tabs/Tab";
import { createTabs } from "../Tabs/TabNavigator";

const canvas= new UICanvas();

type UIContainer = UICanvas|UIContainerRect|UIContainerStack|UIScrollRect;
type InventoryOptions = {
    tabDefinitions:TabDefinition[], 
    width?:number,
    height?:number,
    tabDefaultSize?:number,
    slotSize?:number
}

const createInventory = (parent:UIContainer = canvas, options:InventoryOptions) => {
    const { tabDefinitions, height, width, tabDefaultSize = 100, slotSize } = options;

    const callbacks = {
        onClickItem:null,
        onChangeActiveTab:null
    };

    const state = {
        currentTab:tabDefinitions[0],
        selectedElement:null
    };
    const background = new UIContainerRect(parent);
    background.color = Color4.Black();    
    
    background.opacity = 0.3;
    const container = new UIContainerRect(parent);      
    background.height =  container.height = height || 300;
    background.width = container.width = width || 400;
    
    const tabNav = createTabs(container, {
        tabDefinitions,
        tabDefaultSize
    });
    
    const slotPanel = createSlotPanel(container, {
        tabDefinitions,
        slotSize:slotSize||64
    });
    slotPanel.onClickItem((item)=>{
        const {alias} = item;
        const element = state.currentTab.elements.find(e=>e.data.alias === alias);
        callbacks.onClickItem && callbacks.onClickItem({...element, alias})
    })

    slotPanel.setMaxSlots(tabDefinitions[0].maxSlots);//TODO tab[0] maxSlots
    slotPanel.setElements(tabDefinitions[0].elements);
    tabNav.onChangeActiveTab((tab)=>{
        state.currentTab = tab.getDefinition();
        //const maxSlots = 1+Math.floor(Math.random()*30);
        slotPanel.setMaxSlots(tab.getDefinition().maxSlots);
        slotPanel.setElements(tab.getDefinition().elements);
        //TODO Inventory shouldn't know about editor store
        callbacks.onChangeActiveTab && callbacks.onChangeActiveTab(tab);
    });
    return {
        onClickItem:(fn)=>{
            callbacks.onClickItem = fn;
            return ()=>callbacks.onClickItem = null;
        },
        onChangeActiveTab:(fn)=>{
            callbacks.onChangeActiveTab = fn;
            return ()=>callbacks.onChangeActiveTab = null;
        },
        dispose:()=>{

        },
        select:(id)=>{
            slotPanel.select(id);
        },
        getState:()=>state
    }
};

export {
    createInventory
}