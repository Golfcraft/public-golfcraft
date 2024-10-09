import { createTab } from "./Tab";

const createTabs = (parent = new UICanvas(), options) => {
    const { tabDefinitions, tabDefaultSize } = options;
    const state = {
        currentTab:tabDefinitions[0]
    };
    const callbacks = {
        onChangeActiveTab:null
    };
   /*  const wrapper = new UIScrollRect(parent);
    wrapper.isHorizontal = true;
    wrapper.width = "100%"; */
    const container = new UIContainerStack(parent);
    container.height = 25;
    container.positionY = 10;
    container.width = "100%";    
    container.vAlign = "top";
    container.hAlign = "left";
   // container.color = Color4.Blue();
    container.spacing = 60;
    container.stackOrientation = 1;
    
    const tabs = tabDefinitions
        .map((tabDefinition,index) => createTab(container, {tabDefinition, active:!index, tabDefaultSize}));
    const getActiveTab = () => {
        return tabs.find(t=>t.isActive());
    }    

    tabs.forEach(tab=>{
            tab.onClick(()=>{                
                if(getActiveTab() !== tab){
                    callbacks.onChangeActiveTab && callbacks.onChangeActiveTab(tab);
                }
                tabs.forEach(tab=>tab.setActive(false));
                tab.setActive(true);
                
            })
    });

    return {
        onChangeActiveTab:(fn)=>{
            callbacks.onChangeActiveTab = fn;
            return () => callbacks.onChangeActiveTab = null;
        }
    }
}

export {
    createTabs    
};