/*****
* Create device to display wearables to be
* distributed during the season
*/

const wearables_display = new Entity()
const wearable_model = new Entity()
const wearable_models = [
    "F_cernunnos_pose",
    "F_dea_matrona_pose",
    "F_epona_pose",
    "F_morrigan_pose",
    "F_tiranis_pose",
    "M_cernunnos_pose",
    "M_dea_matrona_pose",
    "M_epona_pose",
    "M_morrigan_pose",
    "M_tiranis_pose",
]

export const createFashionDisplay = ()=>{
    wearables_display.addComponent(new Transform({
        position: new Vector3(23.5, 1.0, 44.9)  
    }))
    wearables_display.addComponent(new GLTFShape("models/building/fashion_base.gltf"))
    engine.addEntity(wearables_display)
    
    wearable_model.addComponent(new Transform({
        position: new Vector3(0, 0.5, 0)
    }))
    wearable_model.setParent(wearables_display)

    engine.addSystem(new RotationSystem())
}

export const showFashionDisplay = ()=>{
    engine.addEntity(wearables_display)
}

export const hideFashionDisplay = ()=>{
    engine.removeEntity(wearables_display)
}

export class RotationSystem implements ISystem {
    rotation_time = 0.0
    switch_time = 20.0
    update(dt: number) {
        this.rotation_time += dt
        this.switch_time += dt
        if (this.rotation_time > 0.05) {
            this.rotation_time = 0.0
            wearable_model.getComponent(Transform).rotate(Vector3.Up(), 1)
        }
        if (this.switch_time > 10) {
            this.switch_time = 0.0
            const random_wearable = wearable_models[Math.floor(Math.random()*wearable_models.length)]
            wearable_model.addComponentOrReplace(new GLTFShape(`models/fashion/mountain/${random_wearable}.gltf`))
        }
    }
}