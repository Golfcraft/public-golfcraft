import { createPetStore } from "./petshop";
//import catalog =  require("../../../pet-store-service/catalog.json");
const stores:any[] = [];

const CATALOG_ENDPOINT = "https://service.golfcraftgame.com/golfcraft-surprise/pets-catalog";
//const CATALOG_ENDPOINT = 'http://localhost:2568/pets-catalog';

export const createPetLobby = ({onSale}) => {
    return;
    executeTask(async () => {
        try {
            let response = await fetch(CATALOG_ENDPOINT);
            let catalog = await response.json();
            log(catalog);
            Object.values(catalog).forEach(({crateId, name, price, rotation, position})=>{
                log("item", name)
                stores.push(
                    createPetStore({
                        crateId: crateId,
                        name: name,
                        ptprice: price.PT,
                        position: new Vector3(...position),
                        rotation: Quaternion.Euler(...rotation),
                        onSale
                    })
                );
            })
        } catch {
            log("failed to reach URL");
        }
    })
};

export function setUserPetData(userData){
    stores.forEach(item=>item.setUserData(userData));
}

export function hidePetLobby(){
    stores.forEach(item=>item.hideFashionStore());
}

export function showPetLobby(){
    stores.forEach(item=>item.showFashionStore());
}
