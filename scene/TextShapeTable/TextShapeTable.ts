type TextOptions = {
    fontSize?: number,
    color?: Color3,
    hTextAlign?:string,
    font?:string
};

type ColumnDefinition = {
    width?: number,
    truncate?: number,
    text?: TextOptions
};

type EntityOptions = {
    position?: Vector3,
    rotation?: Quaternion,
};

export type TextShapeTableOptions  = {
    data: string[][],
    columns: ColumnDefinition[],
    entity: EntityOptions,
    minWidth?: number,
    text?:TextOptions
};

const defaultOptions = {
    text:{
        fontSize:1,
        color:Color3.Black(),
    }
}

const withDefaultOptions = (options:TextShapeTableOptions) => ({
    text:{
        ...defaultOptions.text,
        ...options.text,
    },
    ...options
});

const createTextShapeTable = (root:Entity, parent:Entity, options:TextShapeTableOptions) => {
    const setup = withDefaultOptions(options);    
    const tableFont:Font = new Font( setup.text.font || Fonts.SanFrancisco_Heavy)
    const entity = new Entity();
    entity.addComponent(new Transform({
        position:setup.entity.position,
    }))
    const state:{data:string[][]} = { data: setup.data };
    
    const texts:string[] = getColumnTexts(setup.columns, state.data);

    const columnTextShapes:TextShape[] = setup.columns.map((column, columnIndex)=>{
        const textEntity = new Entity();        
        textEntity.addComponent(new Transform({
            position:new Vector3(getPositionForColumn(column),0,0)
        }))
        const text = new TextShape();
        text.paddingTop = 0;
        text.paddingLeft = 0;
        text.value = texts[columnIndex];
        text.fontSize = column.text?.fontSize || setup.text.fontSize || 1;
        text.vTextAlign = "top";
        text.hTextAlign = column.text?.hTextAlign || 'left';
        text.color = column.text?.color || setup.text.color || Color3.Black();   
        text.font = tableFont;    
        textEntity.addComponent(text);
        textEntity.setParent(entity);


        return text;
    });    
    
    const updateTextShapes = (columns:ColumnDefinition[], data:string[][]) => {
        const texts = getColumnTexts(columns, data);
        columnTextShapes.forEach((text,index)=>{
            text.value = texts[index];
        });
    };

    entity.setParent(parent);

    return {
        show:()=>{},
        hide:()=>{},
        dispose:()=>{},
        updateData:(data:string[][])=>{
            state.data = data;
            updateTextShapes(setup.columns, data);
        }
    };

    function getPositionForColumn(column:ColumnDefinition){        
        if(column.text?.hTextAlign !== "left"){
            const result = setup.columns.reduce((acc, current, columnIndex)=>{
                if(columnIndex > setup.columns.indexOf(column)){
                    acc += (current.width||0);
                }
                return acc;
            },0);
            const totalWidth = Math.max(getColumnsTotalWidth(),setup.minWidth||0);
            return totalWidth - result;    
        } else {
            const result = setup.columns.reduce((acc, current, columnIndex)=>{
                if(columnIndex < setup.columns.indexOf(column)){                    
                    acc += (current.width||0);
                }
                return acc;
            },0);
            return result;  
        }
    }

    function getColumnsTotalWidth(){
        return setup.columns.reduce((a,c)=>a+(c.width||0),0)
    }
};

export { createTextShapeTable };

function getColumnTexts(columns:ColumnDefinition[], data:string[][]){
    return data.reduce((acc, row, rowIndex)=>{
        return acc.map((columnText:string, columnIndex:number)=>{
            return `${columnText}${rowIndex && '\n' || ''}${row[columnIndex]}`
        });
    }, columns.map(i=>''))
}