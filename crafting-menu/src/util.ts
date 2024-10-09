const ChainMaterialKeys = ["Planks","StoneBlocks","IronBars","GoldBars","DMChain"]

export const generateRandomInventoryValues = (min:number, max:number, maxDecrease:number = 0) => {
    let _max = max;
    return ChainMaterialKeys.reduce((acc:any,key)=>{
        acc[key] = min + Math.floor(Math.random() * (_max-min));
        _max -= maxDecrease;
        return acc;
    },{})
}