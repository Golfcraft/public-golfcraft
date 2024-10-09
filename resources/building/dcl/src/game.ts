import { Teleport } from "./imports/index"

//s0 is Golfcraft_Hq_Scene
var scene0_COG0000 = new Entity("COG")
engine.addEntity(scene0_COG0000)
scene0_COG0000.addComponent(new Transform({ position: new Vector3(0, 0, 0) }))
scene0_COG0000.getComponent(Transform).rotation.set(0, 0, 0, 1)
scene0_COG0000.getComponent(Transform).scale.set(1, 1, 1)

var s0_Center_Pillar_Anim_01 = new Entity("Center_Pillar_Anim")
s0_Center_Pillar_Anim_01.setParent(scene0_COG0000)
s0_Center_Pillar_Anim_01.addComponent(new Transform({ position: new Vector3(18.60436, 17.72831, 23.78272) }))
s0_Center_Pillar_Anim_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_Center_Pillar_Anim_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Center_Pillar_Anim_01.addComponent(new GLTFShape("unity_assets/s0_Center_Pillar_Anim_01.gltf"))
s0_Center_Pillar_Anim_01.getComponent(GLTFShape).withCollisions = false
s0_Center_Pillar_Anim_01.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_Golfcraft_Hq_Art_01 = new Entity("Golfcraft_Hq_Art")
s0_Golfcraft_Hq_Art_01.setParent(scene0_COG0000)
s0_Golfcraft_Hq_Art_01.addComponent(new Transform({ position: new Vector3(0, 1.525879E-07, 0) }))
s0_Golfcraft_Hq_Art_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_Golfcraft_Hq_Art_01.getComponent(Transform).scale.set(1, 1, 1)

var s0_Center_Pillar_01_01 = new Entity("Center_Pillar_01")
s0_Center_Pillar_01_01.setParent(s0_Golfcraft_Hq_Art_01)
s0_Center_Pillar_01_01.addComponent(new Transform({ position: new Vector3(0, -1.525879E-07, 0) }))
s0_Center_Pillar_01_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_Center_Pillar_01_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Center_Pillar_01_01.addComponent(new GLTFShape("unity_assets/s0_Center_Pillar_01_01.gltf"))
s0_Center_Pillar_01_01.getComponent(GLTFShape).withCollisions = false
s0_Center_Pillar_01_01.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_Floor_01 = new Entity("Floor")
s0_Floor_01.setParent(s0_Golfcraft_Hq_Art_01)
s0_Floor_01.addComponent(new Transform({ position: new Vector3(0, -1.525879E-07, 0) }))
s0_Floor_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_Floor_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor_01.addComponent(new GLTFShape("unity_assets/s0_Floor_01.gltf"))
s0_Floor_01.getComponent(GLTFShape).withCollisions = false
s0_Floor_01.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_Floor0_01 = new Entity("Floor0")
s0_Floor0_01.setParent(s0_Golfcraft_Hq_Art_01)
s0_Floor0_01.addComponent(new Transform({ position: new Vector3(0, -1.525879E-07, 0) }))
s0_Floor0_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_Floor0_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor0_01.addComponent(new GLTFShape("unity_assets/s0_Floor0_01.gltf"))
s0_Floor0_01.getComponent(GLTFShape).withCollisions = false
s0_Floor0_01.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_Floor_01_01 = new Entity("Floor_01")
s0_Floor_01_01.setParent(s0_Golfcraft_Hq_Art_01)
s0_Floor_01_01.addComponent(new Transform({ position: new Vector3(0, -1.525879E-07, 0) }))
s0_Floor_01_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_Floor_01_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor_01_01.addComponent(new GLTFShape("unity_assets/s0_Floor_01_01.gltf"))
s0_Floor_01_01.getComponent(GLTFShape).withCollisions = false
s0_Floor_01_01.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_Floor_02_01 = new Entity("Floor_02")
s0_Floor_02_01.setParent(s0_Golfcraft_Hq_Art_01)
s0_Floor_02_01.addComponent(new Transform({ position: new Vector3(0, -1.525879E-07, 0) }))
s0_Floor_02_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_Floor_02_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor_02_01.addComponent(new GLTFShape("unity_assets/s0_Floor_02_01.gltf"))
s0_Floor_02_01.getComponent(GLTFShape).withCollisions = false
s0_Floor_02_01.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_Floor_03_01 = new Entity("Floor_03")
s0_Floor_03_01.setParent(s0_Golfcraft_Hq_Art_01)
s0_Floor_03_01.addComponent(new Transform({ position: new Vector3(0, -1.525879E-07, 0) }))
s0_Floor_03_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_Floor_03_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor_03_01.addComponent(new GLTFShape("unity_assets/s0_Floor_03_01.gltf"))
s0_Floor_03_01.getComponent(GLTFShape).withCollisions = false
s0_Floor_03_01.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_Floor_04_01 = new Entity("Floor_04")
s0_Floor_04_01.setParent(s0_Golfcraft_Hq_Art_01)
s0_Floor_04_01.addComponent(new Transform({ position: new Vector3(0, -1.525879E-07, 0) }))
s0_Floor_04_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_Floor_04_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor_04_01.addComponent(new GLTFShape("unity_assets/s0_Floor_04_01.gltf"))
s0_Floor_04_01.getComponent(GLTFShape).withCollisions = false
s0_Floor_04_01.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_Pillars_01 = new Entity("Pillars")
s0_Pillars_01.setParent(s0_Golfcraft_Hq_Art_01)
s0_Pillars_01.addComponent(new Transform({ position: new Vector3(0, -1.525879E-07, 0) }))
s0_Pillars_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_Pillars_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Pillars_01.addComponent(new GLTFShape("unity_assets/s0_Pillars_01.gltf"))
s0_Pillars_01.getComponent(GLTFShape).withCollisions = false
s0_Pillars_01.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_Railing_01 = new Entity("Railing")
s0_Railing_01.setParent(s0_Golfcraft_Hq_Art_01)
s0_Railing_01.addComponent(new Transform({ position: new Vector3(0, -1.525879E-07, 0) }))
s0_Railing_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_Railing_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Railing_01.addComponent(new GLTFShape("unity_assets/s0_Railing_01.gltf"))
s0_Railing_01.getComponent(GLTFShape).withCollisions = false
s0_Railing_01.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_WaterBase_Anim_01 = new Entity("WaterBase_Anim")
s0_WaterBase_Anim_01.setParent(scene0_COG0000)
s0_WaterBase_Anim_01.addComponent(new Transform({ position: new Vector3(0.01876273, 0.000674836, 0.01886302) }))
s0_WaterBase_Anim_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_WaterBase_Anim_01.getComponent(Transform).scale.set(0.4348256, 0.4348256, 0.4348256)
s0_WaterBase_Anim_01.addComponent(new GLTFShape("unity_assets/s0_WaterBase_Anim_01.gltf"))
s0_WaterBase_Anim_01.getComponent(GLTFShape).withCollisions = false
s0_WaterBase_Anim_01.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_Tp_Floor01_02_01 = new Entity("Tp_Floor01_Tartet_01")
s0_Tp_Floor01_02_01.setParent(scene0_COG0000)
s0_Tp_Floor01_02_01.addComponent(new Transform({ position: new Vector3(31.08, 10.1, 13.572) }))
s0_Tp_Floor01_02_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_Tp_Floor01_02_01.getComponent(Transform).scale.set(1.3245, 1, 1)

var s0_Tp_Floor01_02_01 = new Entity("Tp_Floor02_Target_01 ")
s0_Tp_Floor01_02_01.setParent(scene0_COG0000)
s0_Tp_Floor01_02_01.addComponent(new Transform({ position: new Vector3(19.07, 16.4, 33.7) }))
s0_Tp_Floor01_02_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_Tp_Floor01_02_01.getComponent(Transform).scale.set(1.3245, 1, 1)

var s0_Tp_Floor01_02_01 = new Entity("Tp_Floor03_Target_01  ")
s0_Tp_Floor01_02_01.setParent(scene0_COG0000)
s0_Tp_Floor01_02_01.addComponent(new Transform({ position: new Vector3(16.62, 25.56, 16.94) }))
s0_Tp_Floor01_02_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_Tp_Floor01_02_01.getComponent(Transform).scale.set(1.3245, 1, 1)

var s0_Tp_Floor01_02_01 = new Entity("Tp_Floor04_Target_01 ")
s0_Tp_Floor01_02_01.setParent(scene0_COG0000)
s0_Tp_Floor01_02_01.addComponent(new Transform({ position: new Vector3(29.97, 35.43, 28.93) }))
s0_Tp_Floor01_02_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_Tp_Floor01_02_01.getComponent(Transform).scale.set(1.3245, 1, 1)

var s0_Lift_Buttons_Art_01 = new Entity("Lift_Buttons_Art (0)")
s0_Lift_Buttons_Art_01.setParent(scene0_COG0000)
s0_Lift_Buttons_Art_01.addComponent(new Transform({ position: new Vector3(21.16, 1.93, 24.05) }))
s0_Lift_Buttons_Art_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_Lift_Buttons_Art_01.getComponent(Transform).scale.set(1, 1, 1)

var s0_Floor00_B_Art_04 = new Entity("Floor00_B_Art")
s0_Floor00_B_Art_04.setParent(s0_Lift_Buttons_Art_01)
s0_Floor00_B_Art_04.addComponent(new Transform({ position: new Vector3(0, 0, 0) }))
s0_Floor00_B_Art_04.getComponent(Transform).rotation.set(0, 1, 0, 0)
s0_Floor00_B_Art_04.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor00_B_Art_04.addComponent(new GLTFShape("unity_assets/s0_Floor00_B_Art_04.gltf"))
s0_Floor00_B_Art_04.getComponent(GLTFShape).withCollisions = false
s0_Floor00_B_Art_04.getComponent(Transform).rotation.set(0, -4.371139E-08, 0, -1)
var s0_Floor01_B_Art_01 = new Entity("Floor01_B_Art")
s0_Floor01_B_Art_01.setParent(s0_Lift_Buttons_Art_01)
s0_Floor01_B_Art_01.addComponent(new Transform({ position: new Vector3(0, 1, 0) }))
s0_Floor01_B_Art_01.getComponent(Transform).rotation.set(0, 1, 0, 0)
s0_Floor01_B_Art_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor01_B_Art_01.addComponent(new GLTFShape("unity_assets/s0_Floor01_B_Art_01.gltf"))
s0_Floor01_B_Art_01.getComponent(GLTFShape).withCollisions = false
s0_Floor01_B_Art_01.getComponent(Transform).rotation.set(0, -4.371139E-08, 0, -1)
var s0_Floor02_B_Art_01 = new Entity("Floor02_B_Art")
s0_Floor02_B_Art_01.setParent(s0_Lift_Buttons_Art_01)
s0_Floor02_B_Art_01.addComponent(new Transform({ position: new Vector3(0, 2, 0) }))
s0_Floor02_B_Art_01.getComponent(Transform).rotation.set(0, 1, 0, 0)
s0_Floor02_B_Art_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor02_B_Art_01.addComponent(new GLTFShape("unity_assets/s0_Floor02_B_Art_01.gltf"))
s0_Floor02_B_Art_01.getComponent(GLTFShape).withCollisions = false
s0_Floor02_B_Art_01.getComponent(Transform).rotation.set(0, -4.371139E-08, 0, -1)
var s0_Floor03_B_Art_01 = new Entity("Floor03_B_Art")
s0_Floor03_B_Art_01.setParent(s0_Lift_Buttons_Art_01)
s0_Floor03_B_Art_01.addComponent(new Transform({ position: new Vector3(0, 3, 0) }))
s0_Floor03_B_Art_01.getComponent(Transform).rotation.set(0, 1, 0, 0)
s0_Floor03_B_Art_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor03_B_Art_01.addComponent(new GLTFShape("unity_assets/s0_Floor03_B_Art_01.gltf"))
s0_Floor03_B_Art_01.getComponent(GLTFShape).withCollisions = false
s0_Floor03_B_Art_01.getComponent(Transform).rotation.set(0, -4.371139E-08, 0, -1)
var s0_Floor04_B_Art_01 = new Entity("Floor04_B_Art")
s0_Floor04_B_Art_01.setParent(s0_Lift_Buttons_Art_01)
s0_Floor04_B_Art_01.addComponent(new Transform({ position: new Vector3(0, 4, 0) }))
s0_Floor04_B_Art_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_Floor04_B_Art_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor04_B_Art_01.addComponent(new GLTFShape("unity_assets/s0_Floor04_B_Art_01.gltf"))
s0_Floor04_B_Art_01.getComponent(GLTFShape).withCollisions = false
s0_Floor04_B_Art_01.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_Text_4thFloor_01 = new Entity("Text_4thFloor")
s0_Text_4thFloor_01.setParent(s0_Lift_Buttons_Art_01)
s0_Text_4thFloor_01.addComponent(new Transform({ position: new Vector3(-0.04500198, 3.962, 0.01000023) }))
s0_Text_4thFloor_01.getComponent(Transform).rotation.set(0, 0.7071068, 0, 0.7071068)
s0_Text_4thFloor_01.getComponent(Transform).scale.set(0.08590221, 0.08590221, 0.08590221)
s0_Text_4thFloor_01.addComponent(new TextShape())
s0_Text_4thFloor_01.getComponent(TextShape).value = "4th\ floor"
s0_Text_4thFloor_01.getComponent(TextShape).color = new Color3(0, 0.05386595, 0.490566)
s0_Text_4thFloor_01.getComponent(TextShape).opacity = 1
s0_Text_4thFloor_01.getComponent(TextShape).width = 20
s0_Text_4thFloor_01.getComponent(TextShape).height = 5
s0_Text_4thFloor_01.getComponent(TextShape).font = new Font(Fonts.SanFrancisco)
s0_Text_4thFloor_01.getComponent(TextShape).fontSize = 36
s0_Text_4thFloor_01.getComponent(TextShape).lineSpacing = '0'
s0_Text_4thFloor_01.getComponent(TextShape).textWrapping = true
s0_Text_4thFloor_01.getComponent(TextShape).vTextAlign = "top"
s0_Text_4thFloor_01.getComponent(TextShape).outlineWidth = 0
s0_Text_4thFloor_01.getComponent(TextShape).outlineColor = new Color3(0, 0, 0)
s0_Text_4thFloor_01.getComponent(TextShape).paddingTop = 0
s0_Text_4thFloor_01.getComponent(TextShape).paddingLeft = 0

var s0_Text_3thFloor_04 = new Entity("Text_3rdFloor")
s0_Text_3thFloor_04.setParent(s0_Lift_Buttons_Art_01)
s0_Text_3thFloor_04.addComponent(new Transform({ position: new Vector3(-0.04500198, 2.97, 0.01000023) }))
s0_Text_3thFloor_04.getComponent(Transform).rotation.set(0, 0.7071068, 0, 0.7071068)
s0_Text_3thFloor_04.getComponent(Transform).scale.set(0.08590221, 0.08590221, 0.08590221)
s0_Text_3thFloor_04.addComponent(new TextShape())
s0_Text_3thFloor_04.getComponent(TextShape).value = "3rd\ Floor"
s0_Text_3thFloor_04.getComponent(TextShape).color = new Color3(0, 0.05490196, 0.4941176)
s0_Text_3thFloor_04.getComponent(TextShape).opacity = 1
s0_Text_3thFloor_04.getComponent(TextShape).width = 20
s0_Text_3thFloor_04.getComponent(TextShape).height = 5
s0_Text_3thFloor_04.getComponent(TextShape).font = new Font(Fonts.SanFrancisco)
s0_Text_3thFloor_04.getComponent(TextShape).fontSize = 36
s0_Text_3thFloor_04.getComponent(TextShape).lineSpacing = '0'
s0_Text_3thFloor_04.getComponent(TextShape).textWrapping = true
s0_Text_3thFloor_04.getComponent(TextShape).vTextAlign = "top"
s0_Text_3thFloor_04.getComponent(TextShape).outlineWidth = 0
s0_Text_3thFloor_04.getComponent(TextShape).outlineColor = new Color3(0, 0, 0)
s0_Text_3thFloor_04.getComponent(TextShape).paddingTop = 0
s0_Text_3thFloor_04.getComponent(TextShape).paddingLeft = 0

var s0_Text_2thFloor_02 = new Entity("Text_2ndFloor")
s0_Text_2thFloor_02.setParent(s0_Lift_Buttons_Art_01)
s0_Text_2thFloor_02.addComponent(new Transform({ position: new Vector3(-0.04500198, 1.96, 0.01000023) }))
s0_Text_2thFloor_02.getComponent(Transform).rotation.set(0, 0.7071068, 0, 0.7071068)
s0_Text_2thFloor_02.getComponent(Transform).scale.set(0.08590221, 0.08590221, 0.08590221)
s0_Text_2thFloor_02.addComponent(new TextShape())
s0_Text_2thFloor_02.getComponent(TextShape).value = "2nd\ Floor"
s0_Text_2thFloor_02.getComponent(TextShape).color = new Color3(0, 0.05490196, 0.4941176)
s0_Text_2thFloor_02.getComponent(TextShape).opacity = 1
s0_Text_2thFloor_02.getComponent(TextShape).width = 20
s0_Text_2thFloor_02.getComponent(TextShape).height = 5
s0_Text_2thFloor_02.getComponent(TextShape).font = new Font(Fonts.SanFrancisco)
s0_Text_2thFloor_02.getComponent(TextShape).fontSize = 36
s0_Text_2thFloor_02.getComponent(TextShape).lineSpacing = '0'
s0_Text_2thFloor_02.getComponent(TextShape).textWrapping = true
s0_Text_2thFloor_02.getComponent(TextShape).vTextAlign = "top"
s0_Text_2thFloor_02.getComponent(TextShape).outlineWidth = 0
s0_Text_2thFloor_02.getComponent(TextShape).outlineColor = new Color3(0, 0, 0)
s0_Text_2thFloor_02.getComponent(TextShape).paddingTop = 0
s0_Text_2thFloor_02.getComponent(TextShape).paddingLeft = 0

var s0_Text_1thFloor_03 = new Entity("Text_1stFloor")
s0_Text_1thFloor_03.setParent(s0_Lift_Buttons_Art_01)
s0_Text_1thFloor_03.addComponent(new Transform({ position: new Vector3(-0.04500198, 0.96, 0.01000023) }))
s0_Text_1thFloor_03.getComponent(Transform).rotation.set(0, 0.7071068, 0, 0.7071068)
s0_Text_1thFloor_03.getComponent(Transform).scale.set(0.08590221, 0.08590221, 0.08590221)
s0_Text_1thFloor_03.addComponent(new TextShape())
s0_Text_1thFloor_03.getComponent(TextShape).value = "1st\ Floor"
s0_Text_1thFloor_03.getComponent(TextShape).color = new Color3(0, 0.05490196, 0.4941176)
s0_Text_1thFloor_03.getComponent(TextShape).opacity = 1
s0_Text_1thFloor_03.getComponent(TextShape).width = 20
s0_Text_1thFloor_03.getComponent(TextShape).height = 5
s0_Text_1thFloor_03.getComponent(TextShape).font = new Font(Fonts.SanFrancisco)
s0_Text_1thFloor_03.getComponent(TextShape).fontSize = 36
s0_Text_1thFloor_03.getComponent(TextShape).lineSpacing = '0'
s0_Text_1thFloor_03.getComponent(TextShape).textWrapping = true
s0_Text_1thFloor_03.getComponent(TextShape).vTextAlign = "top"
s0_Text_1thFloor_03.getComponent(TextShape).outlineWidth = 0
s0_Text_1thFloor_03.getComponent(TextShape).outlineColor = new Color3(0, 0, 0)
s0_Text_1thFloor_03.getComponent(TextShape).paddingTop = 0
s0_Text_1thFloor_03.getComponent(TextShape).paddingLeft = 0

var s0_Text_Lobby_01 = new Entity("Text _Lobby")
s0_Text_Lobby_01.setParent(s0_Lift_Buttons_Art_01)
s0_Text_Lobby_01.addComponent(new Transform({ position: new Vector3(-0.04500198, -0.05999994, 0.01000023) }))
s0_Text_Lobby_01.getComponent(Transform).rotation.set(0, 0.7071068, 0, 0.7071068)
s0_Text_Lobby_01.getComponent(Transform).scale.set(0.08590221, 0.08590221, 0.08590221)
s0_Text_Lobby_01.addComponent(new TextShape())
s0_Text_Lobby_01.getComponent(TextShape).value = "Lobby"
s0_Text_Lobby_01.getComponent(TextShape).color = new Color3(1, 0.7675856, 0.1745283)
s0_Text_Lobby_01.getComponent(TextShape).opacity = 1
s0_Text_Lobby_01.getComponent(TextShape).width = 20
s0_Text_Lobby_01.getComponent(TextShape).height = 5
s0_Text_Lobby_01.getComponent(TextShape).font = new Font(Fonts.SanFrancisco)
s0_Text_Lobby_01.getComponent(TextShape).fontSize = 36
s0_Text_Lobby_01.getComponent(TextShape).lineSpacing = '0'
s0_Text_Lobby_01.getComponent(TextShape).textWrapping = true
s0_Text_Lobby_01.getComponent(TextShape).vTextAlign = "top"
s0_Text_Lobby_01.getComponent(TextShape).outlineWidth = 0
s0_Text_Lobby_01.getComponent(TextShape).outlineColor = new Color3(0, 0, 0)
s0_Text_Lobby_01.getComponent(TextShape).paddingTop = 0
s0_Text_Lobby_01.getComponent(TextShape).paddingLeft = 0

var s0_Lift_Buttons_Art_01 = new Entity("Lift_Buttons_Art (2)")
s0_Lift_Buttons_Art_01.setParent(scene0_COG0000)
s0_Lift_Buttons_Art_01.addComponent(new Transform({ position: new Vector3(21.52, 15.44, 26.65) }))
s0_Lift_Buttons_Art_01.getComponent(Transform).rotation.set(0, 0.4270746, 0, 0.9042165)
s0_Lift_Buttons_Art_01.getComponent(Transform).scale.set(1, 1, 1)

var s0_Floor00_B_Art_02 = new Entity("Floor00_B_Art")
s0_Floor00_B_Art_02.setParent(s0_Lift_Buttons_Art_01)
s0_Floor00_B_Art_02.addComponent(new Transform({ position: new Vector3(0, 0, 0) }))
s0_Floor00_B_Art_02.getComponent(Transform).rotation.set(0, 1, 0, 0)
s0_Floor00_B_Art_02.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor00_B_Art_02.addComponent(new Teleport({clickEntity:s0_Floor00_B_Art_02, targetLocation: new Vector3(11.347, 3.005109, 23.8875), hoverText:"Lobby", trigger:null, camaraTarget: null, enableTeleportLoop:false, enableDebug:false, delayTeleport:0})) 
s0_Floor00_B_Art_02.addComponent(new GLTFShape("unity_assets/s0_Floor00_B_Art_02.gltf"))
s0_Floor00_B_Art_02.getComponent(GLTFShape).withCollisions = false
s0_Floor00_B_Art_02.getComponent(Transform).rotation.set(0, -4.371139E-08, 0, -1)
var s0_Floor01_B_Art_01 = new Entity("Floor01_B_Art")
s0_Floor01_B_Art_01.setParent(s0_Lift_Buttons_Art_01)
s0_Floor01_B_Art_01.addComponent(new Transform({ position: new Vector3(0, 1, 0) }))
s0_Floor01_B_Art_01.getComponent(Transform).rotation.set(0, 1, 0, 0)
s0_Floor01_B_Art_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor01_B_Art_01.addComponent(new GLTFShape("unity_assets/s0_Floor01_B_Art_01.gltf"))
s0_Floor01_B_Art_01.getComponent(GLTFShape).withCollisions = false
s0_Floor01_B_Art_01.getComponent(Transform).rotation.set(0, -4.371139E-08, 0, -1)
var s0_Floor02_B_Art_01 = new Entity("Floor02_B_Art")
s0_Floor02_B_Art_01.setParent(s0_Lift_Buttons_Art_01)
s0_Floor02_B_Art_01.addComponent(new Transform({ position: new Vector3(0, 2, 0) }))
s0_Floor02_B_Art_01.getComponent(Transform).rotation.set(0, 1, 0, 0)
s0_Floor02_B_Art_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor02_B_Art_01.addComponent(new GLTFShape("unity_assets/s0_Floor02_B_Art_01.gltf"))
s0_Floor02_B_Art_01.getComponent(GLTFShape).withCollisions = false
s0_Floor02_B_Art_01.getComponent(Transform).rotation.set(0, -4.371139E-08, 0, -1)
var s0_Floor03_B_Art_01 = new Entity("Floor03_B_Art")
s0_Floor03_B_Art_01.setParent(s0_Lift_Buttons_Art_01)
s0_Floor03_B_Art_01.addComponent(new Transform({ position: new Vector3(0, 3, 0) }))
s0_Floor03_B_Art_01.getComponent(Transform).rotation.set(0, 1, 0, 0)
s0_Floor03_B_Art_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor03_B_Art_01.addComponent(new GLTFShape("unity_assets/s0_Floor03_B_Art_01.gltf"))
s0_Floor03_B_Art_01.getComponent(GLTFShape).withCollisions = false
s0_Floor03_B_Art_01.getComponent(Transform).rotation.set(0, -4.371139E-08, 0, -1)
var s0_Floor04_B_Art_01 = new Entity("Floor04_B_Art")
s0_Floor04_B_Art_01.setParent(s0_Lift_Buttons_Art_01)
s0_Floor04_B_Art_01.addComponent(new Transform({ position: new Vector3(0, 4, 0) }))
s0_Floor04_B_Art_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_Floor04_B_Art_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor04_B_Art_01.addComponent(new GLTFShape("unity_assets/s0_Floor04_B_Art_01.gltf"))
s0_Floor04_B_Art_01.getComponent(GLTFShape).withCollisions = false
s0_Floor04_B_Art_01.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_Text_4thFloor_04 = new Entity("Text_4thFloor")
s0_Text_4thFloor_04.setParent(s0_Lift_Buttons_Art_01)
s0_Text_4thFloor_04.addComponent(new Transform({ position: new Vector3(-0.04500198, 3.962, 0.01000023) }))
s0_Text_4thFloor_04.getComponent(Transform).rotation.set(0, 0.7071068, 0, 0.7071068)
s0_Text_4thFloor_04.getComponent(Transform).scale.set(0.08590221, 0.08590221, 0.08590221)
s0_Text_4thFloor_04.addComponent(new TextShape())
s0_Text_4thFloor_04.getComponent(TextShape).value = "4th\ floor"
s0_Text_4thFloor_04.getComponent(TextShape).color = new Color3(0, 0.05490196, 0.4941176)
s0_Text_4thFloor_04.getComponent(TextShape).opacity = 1
s0_Text_4thFloor_04.getComponent(TextShape).width = 20
s0_Text_4thFloor_04.getComponent(TextShape).height = 5
s0_Text_4thFloor_04.getComponent(TextShape).font = new Font(Fonts.SanFrancisco)
s0_Text_4thFloor_04.getComponent(TextShape).fontSize = 36
s0_Text_4thFloor_04.getComponent(TextShape).lineSpacing = '0'
s0_Text_4thFloor_04.getComponent(TextShape).textWrapping = true
s0_Text_4thFloor_04.getComponent(TextShape).vTextAlign = "top"
s0_Text_4thFloor_04.getComponent(TextShape).outlineWidth = 0
s0_Text_4thFloor_04.getComponent(TextShape).outlineColor = new Color3(0, 0, 0)
s0_Text_4thFloor_04.getComponent(TextShape).paddingTop = 0
s0_Text_4thFloor_04.getComponent(TextShape).paddingLeft = 0

var s0_Text_3thFloor_02 = new Entity("Text_3rdFloor")
s0_Text_3thFloor_02.setParent(s0_Lift_Buttons_Art_01)
s0_Text_3thFloor_02.addComponent(new Transform({ position: new Vector3(-0.04500198, 2.97, 0.01000023) }))
s0_Text_3thFloor_02.getComponent(Transform).rotation.set(0, 0.7071068, 0, 0.7071068)
s0_Text_3thFloor_02.getComponent(Transform).scale.set(0.08590221, 0.08590221, 0.08590221)
s0_Text_3thFloor_02.addComponent(new TextShape())
s0_Text_3thFloor_02.getComponent(TextShape).value = "3rd\ Floor"
s0_Text_3thFloor_02.getComponent(TextShape).color = new Color3(0, 0.05490196, 0.4941176)
s0_Text_3thFloor_02.getComponent(TextShape).opacity = 1
s0_Text_3thFloor_02.getComponent(TextShape).width = 20
s0_Text_3thFloor_02.getComponent(TextShape).height = 5
s0_Text_3thFloor_02.getComponent(TextShape).font = new Font(Fonts.SanFrancisco)
s0_Text_3thFloor_02.getComponent(TextShape).fontSize = 36
s0_Text_3thFloor_02.getComponent(TextShape).lineSpacing = '0'
s0_Text_3thFloor_02.getComponent(TextShape).textWrapping = true
s0_Text_3thFloor_02.getComponent(TextShape).vTextAlign = "top"
s0_Text_3thFloor_02.getComponent(TextShape).outlineWidth = 0
s0_Text_3thFloor_02.getComponent(TextShape).outlineColor = new Color3(0, 0, 0)
s0_Text_3thFloor_02.getComponent(TextShape).paddingTop = 0
s0_Text_3thFloor_02.getComponent(TextShape).paddingLeft = 0

var s0_Text_2thFloor_01 = new Entity("Text_2ndFloor")
s0_Text_2thFloor_01.setParent(s0_Lift_Buttons_Art_01)
s0_Text_2thFloor_01.addComponent(new Transform({ position: new Vector3(-0.04500198, 1.96, 0.01000023) }))
s0_Text_2thFloor_01.getComponent(Transform).rotation.set(0, 0.7071068, 0, 0.7071068)
s0_Text_2thFloor_01.getComponent(Transform).scale.set(0.08590221, 0.08590221, 0.08590221)
s0_Text_2thFloor_01.addComponent(new TextShape())
s0_Text_2thFloor_01.getComponent(TextShape).value = "2nd\ Floor"
s0_Text_2thFloor_01.getComponent(TextShape).color = new Color3(1, 0.7686275, 0.1764706)
s0_Text_2thFloor_01.getComponent(TextShape).opacity = 1
s0_Text_2thFloor_01.getComponent(TextShape).width = 20
s0_Text_2thFloor_01.getComponent(TextShape).height = 5
s0_Text_2thFloor_01.getComponent(TextShape).font = new Font(Fonts.SanFrancisco)
s0_Text_2thFloor_01.getComponent(TextShape).fontSize = 36
s0_Text_2thFloor_01.getComponent(TextShape).lineSpacing = '0'
s0_Text_2thFloor_01.getComponent(TextShape).textWrapping = true
s0_Text_2thFloor_01.getComponent(TextShape).vTextAlign = "top"
s0_Text_2thFloor_01.getComponent(TextShape).outlineWidth = 0
s0_Text_2thFloor_01.getComponent(TextShape).outlineColor = new Color3(0, 0, 0)
s0_Text_2thFloor_01.getComponent(TextShape).paddingTop = 0
s0_Text_2thFloor_01.getComponent(TextShape).paddingLeft = 0

var s0_Text_1thFloor_04 = new Entity("Text_1stFloor")
s0_Text_1thFloor_04.setParent(s0_Lift_Buttons_Art_01)
s0_Text_1thFloor_04.addComponent(new Transform({ position: new Vector3(-0.04500198, 0.96, 0.01000023) }))
s0_Text_1thFloor_04.getComponent(Transform).rotation.set(0, 0.7071068, 0, 0.7071068)
s0_Text_1thFloor_04.getComponent(Transform).scale.set(0.08590221, 0.08590221, 0.08590221)
s0_Text_1thFloor_04.addComponent(new TextShape())
s0_Text_1thFloor_04.getComponent(TextShape).value = "1st\ Floor"
s0_Text_1thFloor_04.getComponent(TextShape).color = new Color3(0, 0.05490196, 0.4941176)
s0_Text_1thFloor_04.getComponent(TextShape).opacity = 1
s0_Text_1thFloor_04.getComponent(TextShape).width = 20
s0_Text_1thFloor_04.getComponent(TextShape).height = 5
s0_Text_1thFloor_04.getComponent(TextShape).font = new Font(Fonts.SanFrancisco)
s0_Text_1thFloor_04.getComponent(TextShape).fontSize = 36
s0_Text_1thFloor_04.getComponent(TextShape).lineSpacing = '0'
s0_Text_1thFloor_04.getComponent(TextShape).textWrapping = true
s0_Text_1thFloor_04.getComponent(TextShape).vTextAlign = "top"
s0_Text_1thFloor_04.getComponent(TextShape).outlineWidth = 0
s0_Text_1thFloor_04.getComponent(TextShape).outlineColor = new Color3(0, 0, 0)
s0_Text_1thFloor_04.getComponent(TextShape).paddingTop = 0
s0_Text_1thFloor_04.getComponent(TextShape).paddingLeft = 0

var s0_Text_Lobby_04 = new Entity("Text _Lobby")
s0_Text_Lobby_04.setParent(s0_Lift_Buttons_Art_01)
s0_Text_Lobby_04.addComponent(new Transform({ position: new Vector3(-0.04500198, -0.05999994, 0.01000023) }))
s0_Text_Lobby_04.getComponent(Transform).rotation.set(0, 0.7071068, 0, 0.7071068)
s0_Text_Lobby_04.getComponent(Transform).scale.set(0.08590221, 0.08590221, 0.08590221)
s0_Text_Lobby_04.addComponent(new TextShape())
s0_Text_Lobby_04.getComponent(TextShape).value = "Lobby"
s0_Text_Lobby_04.getComponent(TextShape).color = new Color3(0, 0.05490196, 0.4941176)
s0_Text_Lobby_04.getComponent(TextShape).opacity = 1
s0_Text_Lobby_04.getComponent(TextShape).width = 20
s0_Text_Lobby_04.getComponent(TextShape).height = 5
s0_Text_Lobby_04.getComponent(TextShape).font = new Font(Fonts.SanFrancisco)
s0_Text_Lobby_04.getComponent(TextShape).fontSize = 36
s0_Text_Lobby_04.getComponent(TextShape).lineSpacing = '0'
s0_Text_Lobby_04.getComponent(TextShape).textWrapping = true
s0_Text_Lobby_04.getComponent(TextShape).vTextAlign = "top"
s0_Text_Lobby_04.getComponent(TextShape).outlineWidth = 0
s0_Text_Lobby_04.getComponent(TextShape).outlineColor = new Color3(0, 0, 0)
s0_Text_Lobby_04.getComponent(TextShape).paddingTop = 0
s0_Text_Lobby_04.getComponent(TextShape).paddingLeft = 0

var s0_Lift_Buttons_Art_01 = new Entity("Lift_Buttons_Art (3)")
s0_Lift_Buttons_Art_01.setParent(scene0_COG0000)
s0_Lift_Buttons_Art_01.addComponent(new Transform({ position: new Vector3(20.28219, 24.83, 23.88073) }))
s0_Lift_Buttons_Art_01.getComponent(Transform).rotation.set(0, -0.05098908, 0, 0.9986992)
s0_Lift_Buttons_Art_01.getComponent(Transform).scale.set(1, 1, 1)

var s0_Floor00_B_Art_01 = new Entity("Floor00_B_Art")
s0_Floor00_B_Art_01.setParent(s0_Lift_Buttons_Art_01)
s0_Floor00_B_Art_01.addComponent(new Transform({ position: new Vector3(0, 0, 0) }))
s0_Floor00_B_Art_01.getComponent(Transform).rotation.set(0, 1, 0, 0)
s0_Floor00_B_Art_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor00_B_Art_01.addComponent(new Teleport({clickEntity:s0_Floor00_B_Art_01, targetLocation: new Vector3(11.347, 3.005109, 23.8875), hoverText:"Lobby", trigger:null, camaraTarget: null, enableTeleportLoop:false, enableDebug:false, delayTeleport:0})) 
s0_Floor00_B_Art_01.addComponent(new GLTFShape("unity_assets/s0_Floor00_B_Art_01.gltf"))
s0_Floor00_B_Art_01.getComponent(GLTFShape).withCollisions = false
s0_Floor00_B_Art_01.getComponent(Transform).rotation.set(0, -4.371139E-08, 0, -1)
var s0_Floor01_B_Art_01 = new Entity("Floor01_B_Art")
s0_Floor01_B_Art_01.setParent(s0_Lift_Buttons_Art_01)
s0_Floor01_B_Art_01.addComponent(new Transform({ position: new Vector3(0, 1, 0) }))
s0_Floor01_B_Art_01.getComponent(Transform).rotation.set(0, 1, 0, 0)
s0_Floor01_B_Art_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor01_B_Art_01.addComponent(new GLTFShape("unity_assets/s0_Floor01_B_Art_01.gltf"))
s0_Floor01_B_Art_01.getComponent(GLTFShape).withCollisions = false
s0_Floor01_B_Art_01.getComponent(Transform).rotation.set(0, -4.371139E-08, 0, -1)
var s0_Floor02_B_Art_01 = new Entity("Floor02_B_Art")
s0_Floor02_B_Art_01.setParent(s0_Lift_Buttons_Art_01)
s0_Floor02_B_Art_01.addComponent(new Transform({ position: new Vector3(0, 2, 0) }))
s0_Floor02_B_Art_01.getComponent(Transform).rotation.set(0, 1, 0, 0)
s0_Floor02_B_Art_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor02_B_Art_01.addComponent(new GLTFShape("unity_assets/s0_Floor02_B_Art_01.gltf"))
s0_Floor02_B_Art_01.getComponent(GLTFShape).withCollisions = false
s0_Floor02_B_Art_01.getComponent(Transform).rotation.set(0, -4.371139E-08, 0, -1)
var s0_Floor03_B_Art_01 = new Entity("Floor03_B_Art")
s0_Floor03_B_Art_01.setParent(s0_Lift_Buttons_Art_01)
s0_Floor03_B_Art_01.addComponent(new Transform({ position: new Vector3(0, 3, 0) }))
s0_Floor03_B_Art_01.getComponent(Transform).rotation.set(0, 1, 0, 0)
s0_Floor03_B_Art_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor03_B_Art_01.addComponent(new GLTFShape("unity_assets/s0_Floor03_B_Art_01.gltf"))
s0_Floor03_B_Art_01.getComponent(GLTFShape).withCollisions = false
s0_Floor03_B_Art_01.getComponent(Transform).rotation.set(0, -4.371139E-08, 0, -1)
var s0_Floor04_B_Art_01 = new Entity("Floor04_B_Art")
s0_Floor04_B_Art_01.setParent(s0_Lift_Buttons_Art_01)
s0_Floor04_B_Art_01.addComponent(new Transform({ position: new Vector3(0, 4, 0) }))
s0_Floor04_B_Art_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_Floor04_B_Art_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor04_B_Art_01.addComponent(new GLTFShape("unity_assets/s0_Floor04_B_Art_01.gltf"))
s0_Floor04_B_Art_01.getComponent(GLTFShape).withCollisions = false
s0_Floor04_B_Art_01.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_Text_4thFloor_03 = new Entity("Text_4thFloor")
s0_Text_4thFloor_03.setParent(s0_Lift_Buttons_Art_01)
s0_Text_4thFloor_03.addComponent(new Transform({ position: new Vector3(-0.04500198, 3.962, 0.01000023) }))
s0_Text_4thFloor_03.getComponent(Transform).rotation.set(0, 0.7071068, 0, 0.7071068)
s0_Text_4thFloor_03.getComponent(Transform).scale.set(0.08590221, 0.08590221, 0.08590221)
s0_Text_4thFloor_03.addComponent(new TextShape())
s0_Text_4thFloor_03.getComponent(TextShape).value = "4th\ floor"
s0_Text_4thFloor_03.getComponent(TextShape).color = new Color3(0, 0.05490196, 0.4941176)
s0_Text_4thFloor_03.getComponent(TextShape).opacity = 1
s0_Text_4thFloor_03.getComponent(TextShape).width = 20
s0_Text_4thFloor_03.getComponent(TextShape).height = 5
s0_Text_4thFloor_03.getComponent(TextShape).font = new Font(Fonts.SanFrancisco)
s0_Text_4thFloor_03.getComponent(TextShape).fontSize = 36
s0_Text_4thFloor_03.getComponent(TextShape).lineSpacing = '0'
s0_Text_4thFloor_03.getComponent(TextShape).textWrapping = true
s0_Text_4thFloor_03.getComponent(TextShape).vTextAlign = "top"
s0_Text_4thFloor_03.getComponent(TextShape).outlineWidth = 0
s0_Text_4thFloor_03.getComponent(TextShape).outlineColor = new Color3(0, 0, 0)
s0_Text_4thFloor_03.getComponent(TextShape).paddingTop = 0
s0_Text_4thFloor_03.getComponent(TextShape).paddingLeft = 0

var s0_Text_3thFloor_01 = new Entity("Text_3rdFloor")
s0_Text_3thFloor_01.setParent(s0_Lift_Buttons_Art_01)
s0_Text_3thFloor_01.addComponent(new Transform({ position: new Vector3(-0.04500198, 2.97, 0.01000023) }))
s0_Text_3thFloor_01.getComponent(Transform).rotation.set(0, 0.7071068, 0, 0.7071068)
s0_Text_3thFloor_01.getComponent(Transform).scale.set(0.08590221, 0.08590221, 0.08590221)
s0_Text_3thFloor_01.addComponent(new TextShape())
s0_Text_3thFloor_01.getComponent(TextShape).value = "3rd\ Floor"
s0_Text_3thFloor_01.getComponent(TextShape).color = new Color3(1, 0.7686275, 0.1764706)
s0_Text_3thFloor_01.getComponent(TextShape).opacity = 1
s0_Text_3thFloor_01.getComponent(TextShape).width = 20
s0_Text_3thFloor_01.getComponent(TextShape).height = 5
s0_Text_3thFloor_01.getComponent(TextShape).font = new Font(Fonts.SanFrancisco)
s0_Text_3thFloor_01.getComponent(TextShape).fontSize = 36
s0_Text_3thFloor_01.getComponent(TextShape).lineSpacing = '0'
s0_Text_3thFloor_01.getComponent(TextShape).textWrapping = true
s0_Text_3thFloor_01.getComponent(TextShape).vTextAlign = "top"
s0_Text_3thFloor_01.getComponent(TextShape).outlineWidth = 0
s0_Text_3thFloor_01.getComponent(TextShape).outlineColor = new Color3(0, 0, 0)
s0_Text_3thFloor_01.getComponent(TextShape).paddingTop = 0
s0_Text_3thFloor_01.getComponent(TextShape).paddingLeft = 0

var s0_Text_2thFloor_04 = new Entity("Text_2ndFloor")
s0_Text_2thFloor_04.setParent(s0_Lift_Buttons_Art_01)
s0_Text_2thFloor_04.addComponent(new Transform({ position: new Vector3(-0.04500198, 1.96, 0.01000023) }))
s0_Text_2thFloor_04.getComponent(Transform).rotation.set(0, 0.7071068, 0, 0.7071068)
s0_Text_2thFloor_04.getComponent(Transform).scale.set(0.08590221, 0.08590221, 0.08590221)
s0_Text_2thFloor_04.addComponent(new TextShape())
s0_Text_2thFloor_04.getComponent(TextShape).value = "2nd\ Floor"
s0_Text_2thFloor_04.getComponent(TextShape).color = new Color3(0, 0.05490196, 0.4941176)
s0_Text_2thFloor_04.getComponent(TextShape).opacity = 1
s0_Text_2thFloor_04.getComponent(TextShape).width = 20
s0_Text_2thFloor_04.getComponent(TextShape).height = 5
s0_Text_2thFloor_04.getComponent(TextShape).font = new Font(Fonts.SanFrancisco)
s0_Text_2thFloor_04.getComponent(TextShape).fontSize = 36
s0_Text_2thFloor_04.getComponent(TextShape).lineSpacing = '0'
s0_Text_2thFloor_04.getComponent(TextShape).textWrapping = true
s0_Text_2thFloor_04.getComponent(TextShape).vTextAlign = "top"
s0_Text_2thFloor_04.getComponent(TextShape).outlineWidth = 0
s0_Text_2thFloor_04.getComponent(TextShape).outlineColor = new Color3(0, 0, 0)
s0_Text_2thFloor_04.getComponent(TextShape).paddingTop = 0
s0_Text_2thFloor_04.getComponent(TextShape).paddingLeft = 0

var s0_Text_1thFloor_01 = new Entity("Text_1stFloor")
s0_Text_1thFloor_01.setParent(s0_Lift_Buttons_Art_01)
s0_Text_1thFloor_01.addComponent(new Transform({ position: new Vector3(-0.04500198, 0.96, 0.01000023) }))
s0_Text_1thFloor_01.getComponent(Transform).rotation.set(0, 0.7071068, 0, 0.7071068)
s0_Text_1thFloor_01.getComponent(Transform).scale.set(0.08590221, 0.08590221, 0.08590221)
s0_Text_1thFloor_01.addComponent(new TextShape())
s0_Text_1thFloor_01.getComponent(TextShape).value = "1st\ Floor"
s0_Text_1thFloor_01.getComponent(TextShape).color = new Color3(0, 0.05490196, 0.4941176)
s0_Text_1thFloor_01.getComponent(TextShape).opacity = 1
s0_Text_1thFloor_01.getComponent(TextShape).width = 20
s0_Text_1thFloor_01.getComponent(TextShape).height = 5
s0_Text_1thFloor_01.getComponent(TextShape).font = new Font(Fonts.SanFrancisco)
s0_Text_1thFloor_01.getComponent(TextShape).fontSize = 36
s0_Text_1thFloor_01.getComponent(TextShape).lineSpacing = '0'
s0_Text_1thFloor_01.getComponent(TextShape).textWrapping = true
s0_Text_1thFloor_01.getComponent(TextShape).vTextAlign = "top"
s0_Text_1thFloor_01.getComponent(TextShape).outlineWidth = 0
s0_Text_1thFloor_01.getComponent(TextShape).outlineColor = new Color3(0, 0, 0)
s0_Text_1thFloor_01.getComponent(TextShape).paddingTop = 0
s0_Text_1thFloor_01.getComponent(TextShape).paddingLeft = 0

var s0_Text_Lobby_02 = new Entity("Text _Lobby")
s0_Text_Lobby_02.setParent(s0_Lift_Buttons_Art_01)
s0_Text_Lobby_02.addComponent(new Transform({ position: new Vector3(-0.04500198, -0.05999994, 0.01000023) }))
s0_Text_Lobby_02.getComponent(Transform).rotation.set(0, 0.7071068, 0, 0.7071068)
s0_Text_Lobby_02.getComponent(Transform).scale.set(0.08590221, 0.08590221, 0.08590221)
s0_Text_Lobby_02.addComponent(new TextShape())
s0_Text_Lobby_02.getComponent(TextShape).value = "Lobby"
s0_Text_Lobby_02.getComponent(TextShape).color = new Color3(0, 0.05490196, 0.4941176)
s0_Text_Lobby_02.getComponent(TextShape).opacity = 1
s0_Text_Lobby_02.getComponent(TextShape).width = 20
s0_Text_Lobby_02.getComponent(TextShape).height = 5
s0_Text_Lobby_02.getComponent(TextShape).font = new Font(Fonts.SanFrancisco)
s0_Text_Lobby_02.getComponent(TextShape).fontSize = 36
s0_Text_Lobby_02.getComponent(TextShape).lineSpacing = '0'
s0_Text_Lobby_02.getComponent(TextShape).textWrapping = true
s0_Text_Lobby_02.getComponent(TextShape).vTextAlign = "top"
s0_Text_Lobby_02.getComponent(TextShape).outlineWidth = 0
s0_Text_Lobby_02.getComponent(TextShape).outlineColor = new Color3(0, 0, 0)
s0_Text_Lobby_02.getComponent(TextShape).paddingTop = 0
s0_Text_Lobby_02.getComponent(TextShape).paddingLeft = 0

var s0_Lift_Buttons_Art_01 = new Entity("Lift_Buttons_Art (4)")
s0_Lift_Buttons_Art_01.setParent(scene0_COG0000)
s0_Lift_Buttons_Art_01.addComponent(new Transform({ position: new Vector3(27.42471, 34.46, 24.49001) }))
s0_Lift_Buttons_Art_01.getComponent(Transform).rotation.set(0, 0.9966239, 0, 0.08210234)
s0_Lift_Buttons_Art_01.getComponent(Transform).scale.set(1, 1, 1)

var s0_Floor00_B_Art_03 = new Entity("Floor00_B_Art")
s0_Floor00_B_Art_03.setParent(s0_Lift_Buttons_Art_01)
s0_Floor00_B_Art_03.addComponent(new Transform({ position: new Vector3(0, 0, 0) }))
s0_Floor00_B_Art_03.getComponent(Transform).rotation.set(0, 1, 0, 0)
s0_Floor00_B_Art_03.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor00_B_Art_03.addComponent(new Teleport({clickEntity:s0_Floor00_B_Art_03, targetLocation: new Vector3(11.347, 3.005109, 23.8875), hoverText:"Lobby", trigger:null, camaraTarget: null, enableTeleportLoop:false, enableDebug:false, delayTeleport:0})) 
s0_Floor00_B_Art_03.addComponent(new GLTFShape("unity_assets/s0_Floor00_B_Art_03.gltf"))
s0_Floor00_B_Art_03.getComponent(GLTFShape).withCollisions = false
s0_Floor00_B_Art_03.getComponent(Transform).rotation.set(0, -4.371139E-08, 0, -1)
var s0_Floor01_B_Art_01 = new Entity("Floor01_B_Art")
s0_Floor01_B_Art_01.setParent(s0_Lift_Buttons_Art_01)
s0_Floor01_B_Art_01.addComponent(new Transform({ position: new Vector3(0, 1, 0) }))
s0_Floor01_B_Art_01.getComponent(Transform).rotation.set(0, 1, 0, 0)
s0_Floor01_B_Art_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor01_B_Art_01.addComponent(new GLTFShape("unity_assets/s0_Floor01_B_Art_01.gltf"))
s0_Floor01_B_Art_01.getComponent(GLTFShape).withCollisions = false
s0_Floor01_B_Art_01.getComponent(Transform).rotation.set(0, -4.371139E-08, 0, -1)
var s0_Floor02_B_Art_01 = new Entity("Floor02_B_Art")
s0_Floor02_B_Art_01.setParent(s0_Lift_Buttons_Art_01)
s0_Floor02_B_Art_01.addComponent(new Transform({ position: new Vector3(0, 2, 0) }))
s0_Floor02_B_Art_01.getComponent(Transform).rotation.set(0, 1, 0, 0)
s0_Floor02_B_Art_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor02_B_Art_01.addComponent(new GLTFShape("unity_assets/s0_Floor02_B_Art_01.gltf"))
s0_Floor02_B_Art_01.getComponent(GLTFShape).withCollisions = false
s0_Floor02_B_Art_01.getComponent(Transform).rotation.set(0, -4.371139E-08, 0, -1)
var s0_Floor03_B_Art_01 = new Entity("Floor03_B_Art")
s0_Floor03_B_Art_01.setParent(s0_Lift_Buttons_Art_01)
s0_Floor03_B_Art_01.addComponent(new Transform({ position: new Vector3(0, 3, 0) }))
s0_Floor03_B_Art_01.getComponent(Transform).rotation.set(0, 1, 0, 0)
s0_Floor03_B_Art_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor03_B_Art_01.addComponent(new GLTFShape("unity_assets/s0_Floor03_B_Art_01.gltf"))
s0_Floor03_B_Art_01.getComponent(GLTFShape).withCollisions = false
s0_Floor03_B_Art_01.getComponent(Transform).rotation.set(0, -4.371139E-08, 0, -1)
var s0_Floor04_B_Art_01 = new Entity("Floor04_B_Art")
s0_Floor04_B_Art_01.setParent(s0_Lift_Buttons_Art_01)
s0_Floor04_B_Art_01.addComponent(new Transform({ position: new Vector3(0, 4, 0) }))
s0_Floor04_B_Art_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_Floor04_B_Art_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor04_B_Art_01.addComponent(new GLTFShape("unity_assets/s0_Floor04_B_Art_01.gltf"))
s0_Floor04_B_Art_01.getComponent(GLTFShape).withCollisions = false
s0_Floor04_B_Art_01.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_Text_4thFloor_02 = new Entity("Text_4thFloor")
s0_Text_4thFloor_02.setParent(s0_Lift_Buttons_Art_01)
s0_Text_4thFloor_02.addComponent(new Transform({ position: new Vector3(-0.04500198, 3.962, 0.01000023) }))
s0_Text_4thFloor_02.getComponent(Transform).rotation.set(0, 0.7071068, 0, 0.7071068)
s0_Text_4thFloor_02.getComponent(Transform).scale.set(0.08590221, 0.08590221, 0.08590221)
s0_Text_4thFloor_02.addComponent(new TextShape())
s0_Text_4thFloor_02.getComponent(TextShape).value = "4th\ floor"
s0_Text_4thFloor_02.getComponent(TextShape).color = new Color3(1, 0.7686275, 0.1764706)
s0_Text_4thFloor_02.getComponent(TextShape).opacity = 1
s0_Text_4thFloor_02.getComponent(TextShape).width = 20
s0_Text_4thFloor_02.getComponent(TextShape).height = 5
s0_Text_4thFloor_02.getComponent(TextShape).font = new Font(Fonts.SanFrancisco)
s0_Text_4thFloor_02.getComponent(TextShape).fontSize = 36
s0_Text_4thFloor_02.getComponent(TextShape).lineSpacing = '0'
s0_Text_4thFloor_02.getComponent(TextShape).textWrapping = true
s0_Text_4thFloor_02.getComponent(TextShape).vTextAlign = "top"
s0_Text_4thFloor_02.getComponent(TextShape).outlineWidth = 0
s0_Text_4thFloor_02.getComponent(TextShape).outlineColor = new Color3(0, 0, 0)
s0_Text_4thFloor_02.getComponent(TextShape).paddingTop = 0
s0_Text_4thFloor_02.getComponent(TextShape).paddingLeft = 0

var s0_Text_3thFloor_03 = new Entity("Text_3rdFloor")
s0_Text_3thFloor_03.setParent(s0_Lift_Buttons_Art_01)
s0_Text_3thFloor_03.addComponent(new Transform({ position: new Vector3(-0.04500198, 2.97, 0.01000023) }))
s0_Text_3thFloor_03.getComponent(Transform).rotation.set(0, 0.7071068, 0, 0.7071068)
s0_Text_3thFloor_03.getComponent(Transform).scale.set(0.08590221, 0.08590221, 0.08590221)
s0_Text_3thFloor_03.addComponent(new TextShape())
s0_Text_3thFloor_03.getComponent(TextShape).value = "3rd\ Floor"
s0_Text_3thFloor_03.getComponent(TextShape).color = new Color3(0, 0.05490196, 0.4941176)
s0_Text_3thFloor_03.getComponent(TextShape).opacity = 1
s0_Text_3thFloor_03.getComponent(TextShape).width = 20
s0_Text_3thFloor_03.getComponent(TextShape).height = 5
s0_Text_3thFloor_03.getComponent(TextShape).font = new Font(Fonts.SanFrancisco)
s0_Text_3thFloor_03.getComponent(TextShape).fontSize = 36
s0_Text_3thFloor_03.getComponent(TextShape).lineSpacing = '0'
s0_Text_3thFloor_03.getComponent(TextShape).textWrapping = true
s0_Text_3thFloor_03.getComponent(TextShape).vTextAlign = "top"
s0_Text_3thFloor_03.getComponent(TextShape).outlineWidth = 0
s0_Text_3thFloor_03.getComponent(TextShape).outlineColor = new Color3(0, 0, 0)
s0_Text_3thFloor_03.getComponent(TextShape).paddingTop = 0
s0_Text_3thFloor_03.getComponent(TextShape).paddingLeft = 0

var s0_Text_2thFloor_03 = new Entity("Text_2ndFloor")
s0_Text_2thFloor_03.setParent(s0_Lift_Buttons_Art_01)
s0_Text_2thFloor_03.addComponent(new Transform({ position: new Vector3(-0.04500198, 1.96, 0.01000023) }))
s0_Text_2thFloor_03.getComponent(Transform).rotation.set(0, 0.7071068, 0, 0.7071068)
s0_Text_2thFloor_03.getComponent(Transform).scale.set(0.08590221, 0.08590221, 0.08590221)
s0_Text_2thFloor_03.addComponent(new TextShape())
s0_Text_2thFloor_03.getComponent(TextShape).value = "2nd\ Floor"
s0_Text_2thFloor_03.getComponent(TextShape).color = new Color3(0, 0.05490196, 0.4941176)
s0_Text_2thFloor_03.getComponent(TextShape).opacity = 1
s0_Text_2thFloor_03.getComponent(TextShape).width = 20
s0_Text_2thFloor_03.getComponent(TextShape).height = 5
s0_Text_2thFloor_03.getComponent(TextShape).font = new Font(Fonts.SanFrancisco)
s0_Text_2thFloor_03.getComponent(TextShape).fontSize = 36
s0_Text_2thFloor_03.getComponent(TextShape).lineSpacing = '0'
s0_Text_2thFloor_03.getComponent(TextShape).textWrapping = true
s0_Text_2thFloor_03.getComponent(TextShape).vTextAlign = "top"
s0_Text_2thFloor_03.getComponent(TextShape).outlineWidth = 0
s0_Text_2thFloor_03.getComponent(TextShape).outlineColor = new Color3(0, 0, 0)
s0_Text_2thFloor_03.getComponent(TextShape).paddingTop = 0
s0_Text_2thFloor_03.getComponent(TextShape).paddingLeft = 0

var s0_Text_1thFloor_02 = new Entity("Text_1stFloor")
s0_Text_1thFloor_02.setParent(s0_Lift_Buttons_Art_01)
s0_Text_1thFloor_02.addComponent(new Transform({ position: new Vector3(-0.04500198, 0.96, 0.01000023) }))
s0_Text_1thFloor_02.getComponent(Transform).rotation.set(0, 0.7071068, 0, 0.7071068)
s0_Text_1thFloor_02.getComponent(Transform).scale.set(0.08590221, 0.08590221, 0.08590221)
s0_Text_1thFloor_02.addComponent(new TextShape())
s0_Text_1thFloor_02.getComponent(TextShape).value = "1st\ Floor"
s0_Text_1thFloor_02.getComponent(TextShape).color = new Color3(0, 0.05490196, 0.4941176)
s0_Text_1thFloor_02.getComponent(TextShape).opacity = 1
s0_Text_1thFloor_02.getComponent(TextShape).width = 20
s0_Text_1thFloor_02.getComponent(TextShape).height = 5
s0_Text_1thFloor_02.getComponent(TextShape).font = new Font(Fonts.SanFrancisco)
s0_Text_1thFloor_02.getComponent(TextShape).fontSize = 36
s0_Text_1thFloor_02.getComponent(TextShape).lineSpacing = '0'
s0_Text_1thFloor_02.getComponent(TextShape).textWrapping = true
s0_Text_1thFloor_02.getComponent(TextShape).vTextAlign = "top"
s0_Text_1thFloor_02.getComponent(TextShape).outlineWidth = 0
s0_Text_1thFloor_02.getComponent(TextShape).outlineColor = new Color3(0, 0, 0)
s0_Text_1thFloor_02.getComponent(TextShape).paddingTop = 0
s0_Text_1thFloor_02.getComponent(TextShape).paddingLeft = 0

var s0_Text_Lobby_03 = new Entity("Text _Lobby")
s0_Text_Lobby_03.setParent(s0_Lift_Buttons_Art_01)
s0_Text_Lobby_03.addComponent(new Transform({ position: new Vector3(-0.04500198, -0.05999994, 0.01000023) }))
s0_Text_Lobby_03.getComponent(Transform).rotation.set(0, 0.7071068, 0, 0.7071068)
s0_Text_Lobby_03.getComponent(Transform).scale.set(0.08590221, 0.08590221, 0.08590221)
s0_Text_Lobby_03.addComponent(new TextShape())
s0_Text_Lobby_03.getComponent(TextShape).value = "Lobby"
s0_Text_Lobby_03.getComponent(TextShape).color = new Color3(0, 0.05490196, 0.4941176)
s0_Text_Lobby_03.getComponent(TextShape).opacity = 1
s0_Text_Lobby_03.getComponent(TextShape).width = 20
s0_Text_Lobby_03.getComponent(TextShape).height = 5
s0_Text_Lobby_03.getComponent(TextShape).font = new Font(Fonts.SanFrancisco)
s0_Text_Lobby_03.getComponent(TextShape).fontSize = 36
s0_Text_Lobby_03.getComponent(TextShape).lineSpacing = '0'
s0_Text_Lobby_03.getComponent(TextShape).textWrapping = true
s0_Text_Lobby_03.getComponent(TextShape).vTextAlign = "top"
s0_Text_Lobby_03.getComponent(TextShape).outlineWidth = 0
s0_Text_Lobby_03.getComponent(TextShape).outlineColor = new Color3(0, 0, 0)
s0_Text_Lobby_03.getComponent(TextShape).paddingTop = 0
s0_Text_Lobby_03.getComponent(TextShape).paddingLeft = 0

var s0_Golfcraft_Logo_Art_01 = new Entity("Golfcraft_Logo_Art")
s0_Golfcraft_Logo_Art_01.setParent(scene0_COG0000)
s0_Golfcraft_Logo_Art_01.addComponent(new Transform({ position: new Vector3(21.58916, 13.04673, 34.27632) }))
s0_Golfcraft_Logo_Art_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_Golfcraft_Logo_Art_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Golfcraft_Logo_Art_01.addComponent(new GLTFShape("unity_assets/s0_Golfcraft_Logo_Art_01.gltf"))
s0_Golfcraft_Logo_Art_01.getComponent(GLTFShape).withCollisions = false
s0_Golfcraft_Logo_Art_01.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_Lift_Buttons_Art_01 = new Entity("Lift_Buttons_Art (1)")
s0_Lift_Buttons_Art_01.setParent(scene0_COG0000)
s0_Lift_Buttons_Art_01.addComponent(new Transform({ position: new Vector3(25.101, 8.695, 20.921) }))
s0_Lift_Buttons_Art_01.getComponent(Transform).rotation.set(0, 0.7919314, 0, -0.6106101)
s0_Lift_Buttons_Art_01.getComponent(Transform).scale.set(1, 1, 1)

var s0_Floor00_B_Art_05 = new Entity("Floor00_B_Art")
s0_Floor00_B_Art_05.setParent(s0_Lift_Buttons_Art_01)
s0_Floor00_B_Art_05.addComponent(new Transform({ position: new Vector3(0, 0, 0) }))
s0_Floor00_B_Art_05.getComponent(Transform).rotation.set(0, 1, 0, 0)
s0_Floor00_B_Art_05.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor00_B_Art_05.addComponent(new Teleport({clickEntity:s0_Floor00_B_Art_05, targetLocation: new Vector3(11.347, 3.005109, 23.8875), hoverText:"Lobby", trigger:null, camaraTarget: null, enableTeleportLoop:false, enableDebug:false, delayTeleport:0})) 
s0_Floor00_B_Art_05.addComponent(new GLTFShape("unity_assets/s0_Floor00_B_Art_05.gltf"))
s0_Floor00_B_Art_05.getComponent(GLTFShape).withCollisions = false
s0_Floor00_B_Art_05.getComponent(Transform).rotation.set(0, -4.371139E-08, 0, -1)
var s0_Floor01_B_Art_01 = new Entity("Floor01_B_Art")
s0_Floor01_B_Art_01.setParent(s0_Lift_Buttons_Art_01)
s0_Floor01_B_Art_01.addComponent(new Transform({ position: new Vector3(0, 1, 0) }))
s0_Floor01_B_Art_01.getComponent(Transform).rotation.set(0, 1, 0, 0)
s0_Floor01_B_Art_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor01_B_Art_01.addComponent(new GLTFShape("unity_assets/s0_Floor01_B_Art_01.gltf"))
s0_Floor01_B_Art_01.getComponent(GLTFShape).withCollisions = false
s0_Floor01_B_Art_01.getComponent(Transform).rotation.set(0, -4.371139E-08, 0, -1)
var s0_Floor02_B_Art_01 = new Entity("Floor02_B_Art")
s0_Floor02_B_Art_01.setParent(s0_Lift_Buttons_Art_01)
s0_Floor02_B_Art_01.addComponent(new Transform({ position: new Vector3(0, 2, 0) }))
s0_Floor02_B_Art_01.getComponent(Transform).rotation.set(0, 1, 0, 0)
s0_Floor02_B_Art_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor02_B_Art_01.addComponent(new GLTFShape("unity_assets/s0_Floor02_B_Art_01.gltf"))
s0_Floor02_B_Art_01.getComponent(GLTFShape).withCollisions = false
s0_Floor02_B_Art_01.getComponent(Transform).rotation.set(0, -4.371139E-08, 0, -1)
var s0_Floor03_B_Art_01 = new Entity("Floor03_B_Art")
s0_Floor03_B_Art_01.setParent(s0_Lift_Buttons_Art_01)
s0_Floor03_B_Art_01.addComponent(new Transform({ position: new Vector3(0, 3, 0) }))
s0_Floor03_B_Art_01.getComponent(Transform).rotation.set(0, 1, 0, 0)
s0_Floor03_B_Art_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor03_B_Art_01.addComponent(new GLTFShape("unity_assets/s0_Floor03_B_Art_01.gltf"))
s0_Floor03_B_Art_01.getComponent(GLTFShape).withCollisions = false
s0_Floor03_B_Art_01.getComponent(Transform).rotation.set(0, -4.371139E-08, 0, -1)
var s0_Floor04_B_Art_01 = new Entity("Floor04_B_Art")
s0_Floor04_B_Art_01.setParent(s0_Lift_Buttons_Art_01)
s0_Floor04_B_Art_01.addComponent(new Transform({ position: new Vector3(0, 4, 0) }))
s0_Floor04_B_Art_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_Floor04_B_Art_01.getComponent(Transform).scale.set(1, 1, 1)
s0_Floor04_B_Art_01.addComponent(new GLTFShape("unity_assets/s0_Floor04_B_Art_01.gltf"))
s0_Floor04_B_Art_01.getComponent(GLTFShape).withCollisions = false
s0_Floor04_B_Art_01.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_Text_4thFloor_05 = new Entity("Text_4thFloor")
s0_Text_4thFloor_05.setParent(s0_Lift_Buttons_Art_01)
s0_Text_4thFloor_05.addComponent(new Transform({ position: new Vector3(-0.04500198, 3.962, 0.01000023) }))
s0_Text_4thFloor_05.getComponent(Transform).rotation.set(0, 0.7071068, 0, 0.7071068)
s0_Text_4thFloor_05.getComponent(Transform).scale.set(0.08590221, 0.08590221, 0.08590221)
s0_Text_4thFloor_05.addComponent(new TextShape())
s0_Text_4thFloor_05.getComponent(TextShape).value = "4th\ floor"
s0_Text_4thFloor_05.getComponent(TextShape).color = new Color3(0, 0.05490196, 0.4941176)
s0_Text_4thFloor_05.getComponent(TextShape).opacity = 1
s0_Text_4thFloor_05.getComponent(TextShape).width = 20
s0_Text_4thFloor_05.getComponent(TextShape).height = 5
s0_Text_4thFloor_05.getComponent(TextShape).font = new Font(Fonts.SanFrancisco)
s0_Text_4thFloor_05.getComponent(TextShape).fontSize = 36
s0_Text_4thFloor_05.getComponent(TextShape).lineSpacing = '0'
s0_Text_4thFloor_05.getComponent(TextShape).textWrapping = true
s0_Text_4thFloor_05.getComponent(TextShape).vTextAlign = "top"
s0_Text_4thFloor_05.getComponent(TextShape).outlineWidth = 0
s0_Text_4thFloor_05.getComponent(TextShape).outlineColor = new Color3(0, 0, 0)
s0_Text_4thFloor_05.getComponent(TextShape).paddingTop = 0
s0_Text_4thFloor_05.getComponent(TextShape).paddingLeft = 0

var s0_Text_3thFloor_05 = new Entity("Text_3rdFloor")
s0_Text_3thFloor_05.setParent(s0_Lift_Buttons_Art_01)
s0_Text_3thFloor_05.addComponent(new Transform({ position: new Vector3(-0.04500198, 2.97, 0.01000023) }))
s0_Text_3thFloor_05.getComponent(Transform).rotation.set(0, 0.7071068, 0, 0.7071068)
s0_Text_3thFloor_05.getComponent(Transform).scale.set(0.08590221, 0.08590221, 0.08590221)
s0_Text_3thFloor_05.addComponent(new TextShape())
s0_Text_3thFloor_05.getComponent(TextShape).value = "3rd\ Floor"
s0_Text_3thFloor_05.getComponent(TextShape).color = new Color3(0, 0.05490196, 0.4941176)
s0_Text_3thFloor_05.getComponent(TextShape).opacity = 1
s0_Text_3thFloor_05.getComponent(TextShape).width = 20
s0_Text_3thFloor_05.getComponent(TextShape).height = 5
s0_Text_3thFloor_05.getComponent(TextShape).font = new Font(Fonts.SanFrancisco)
s0_Text_3thFloor_05.getComponent(TextShape).fontSize = 36
s0_Text_3thFloor_05.getComponent(TextShape).lineSpacing = '0'
s0_Text_3thFloor_05.getComponent(TextShape).textWrapping = true
s0_Text_3thFloor_05.getComponent(TextShape).vTextAlign = "top"
s0_Text_3thFloor_05.getComponent(TextShape).outlineWidth = 0
s0_Text_3thFloor_05.getComponent(TextShape).outlineColor = new Color3(0, 0, 0)
s0_Text_3thFloor_05.getComponent(TextShape).paddingTop = 0
s0_Text_3thFloor_05.getComponent(TextShape).paddingLeft = 0

var s0_Text_2thFloor_05 = new Entity("Text_2ndFloor")
s0_Text_2thFloor_05.setParent(s0_Lift_Buttons_Art_01)
s0_Text_2thFloor_05.addComponent(new Transform({ position: new Vector3(-0.04500198, 1.96, 0.01000023) }))
s0_Text_2thFloor_05.getComponent(Transform).rotation.set(0, 0.7071068, 0, 0.7071068)
s0_Text_2thFloor_05.getComponent(Transform).scale.set(0.08590221, 0.08590221, 0.08590221)
s0_Text_2thFloor_05.addComponent(new TextShape())
s0_Text_2thFloor_05.getComponent(TextShape).value = "2nd\ Floor"
s0_Text_2thFloor_05.getComponent(TextShape).color = new Color3(0, 0.05490196, 0.4941176)
s0_Text_2thFloor_05.getComponent(TextShape).opacity = 1
s0_Text_2thFloor_05.getComponent(TextShape).width = 20
s0_Text_2thFloor_05.getComponent(TextShape).height = 5
s0_Text_2thFloor_05.getComponent(TextShape).font = new Font(Fonts.SanFrancisco)
s0_Text_2thFloor_05.getComponent(TextShape).fontSize = 36
s0_Text_2thFloor_05.getComponent(TextShape).lineSpacing = '0'
s0_Text_2thFloor_05.getComponent(TextShape).textWrapping = true
s0_Text_2thFloor_05.getComponent(TextShape).vTextAlign = "top"
s0_Text_2thFloor_05.getComponent(TextShape).outlineWidth = 0
s0_Text_2thFloor_05.getComponent(TextShape).outlineColor = new Color3(0, 0, 0)
s0_Text_2thFloor_05.getComponent(TextShape).paddingTop = 0
s0_Text_2thFloor_05.getComponent(TextShape).paddingLeft = 0

var s0_Text_1thFloor_05 = new Entity("Text_1stFloor")
s0_Text_1thFloor_05.setParent(s0_Lift_Buttons_Art_01)
s0_Text_1thFloor_05.addComponent(new Transform({ position: new Vector3(-0.04500198, 0.96, 0.01000023) }))
s0_Text_1thFloor_05.getComponent(Transform).rotation.set(0, 0.7071068, 0, 0.7071068)
s0_Text_1thFloor_05.getComponent(Transform).scale.set(0.08590221, 0.08590221, 0.08590221)
s0_Text_1thFloor_05.addComponent(new TextShape())
s0_Text_1thFloor_05.getComponent(TextShape).value = "1st\ Floor"
s0_Text_1thFloor_05.getComponent(TextShape).color = new Color3(1, 0.7686275, 0.1764706)
s0_Text_1thFloor_05.getComponent(TextShape).opacity = 1
s0_Text_1thFloor_05.getComponent(TextShape).width = 20
s0_Text_1thFloor_05.getComponent(TextShape).height = 5
s0_Text_1thFloor_05.getComponent(TextShape).font = new Font(Fonts.SanFrancisco)
s0_Text_1thFloor_05.getComponent(TextShape).fontSize = 36
s0_Text_1thFloor_05.getComponent(TextShape).lineSpacing = '0'
s0_Text_1thFloor_05.getComponent(TextShape).textWrapping = true
s0_Text_1thFloor_05.getComponent(TextShape).vTextAlign = "top"
s0_Text_1thFloor_05.getComponent(TextShape).outlineWidth = 0
s0_Text_1thFloor_05.getComponent(TextShape).outlineColor = new Color3(0, 0, 0)
s0_Text_1thFloor_05.getComponent(TextShape).paddingTop = 0
s0_Text_1thFloor_05.getComponent(TextShape).paddingLeft = 0

var s0_Text_Lobby_05 = new Entity("Text _Lobby")
s0_Text_Lobby_05.setParent(s0_Lift_Buttons_Art_01)
s0_Text_Lobby_05.addComponent(new Transform({ position: new Vector3(-0.04500198, -0.05999994, 0.01000023) }))
s0_Text_Lobby_05.getComponent(Transform).rotation.set(0, 0.7071068, 0, 0.7071068)
s0_Text_Lobby_05.getComponent(Transform).scale.set(0.08590221, 0.08590221, 0.08590221)
s0_Text_Lobby_05.addComponent(new TextShape())
s0_Text_Lobby_05.getComponent(TextShape).value = "Lobby"
s0_Text_Lobby_05.getComponent(TextShape).color = new Color3(0, 0.05490196, 0.4941176)
s0_Text_Lobby_05.getComponent(TextShape).opacity = 1
s0_Text_Lobby_05.getComponent(TextShape).width = 20
s0_Text_Lobby_05.getComponent(TextShape).height = 5
s0_Text_Lobby_05.getComponent(TextShape).font = new Font(Fonts.SanFrancisco)
s0_Text_Lobby_05.getComponent(TextShape).fontSize = 36
s0_Text_Lobby_05.getComponent(TextShape).lineSpacing = '0'
s0_Text_Lobby_05.getComponent(TextShape).textWrapping = true
s0_Text_Lobby_05.getComponent(TextShape).vTextAlign = "top"
s0_Text_Lobby_05.getComponent(TextShape).outlineWidth = 0
s0_Text_Lobby_05.getComponent(TextShape).outlineColor = new Color3(0, 0, 0)
s0_Text_Lobby_05.getComponent(TextShape).paddingTop = 0
s0_Text_Lobby_05.getComponent(TextShape).paddingLeft = 0

var s0_Floor0_Boards_01 = new Entity("Floor0_Boards")
engine.addEntity(s0_Floor0_Boards_01)
s0_Floor0_Boards_01.addComponent(new Transform({ position: new Vector3(0, 0, 0) }))
s0_Floor0_Boards_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_Floor0_Boards_01.getComponent(Transform).scale.set(1, 1, 1)

var s0_SquareBoard_Art_0__01 = new Entity("SquareBoard_Art (0)")
s0_SquareBoard_Art_0__01.setParent(s0_Floor0_Boards_01)
s0_SquareBoard_Art_0__01.addComponent(new Transform({ position: new Vector3(14.26, 5.16, 45.71) }))
s0_SquareBoard_Art_0__01.getComponent(Transform).rotation.set(0, 0.9991177, 0, -0.04199947)
s0_SquareBoard_Art_0__01.getComponent(Transform).scale.set(0.9918963, 0.9918963, 0.9918963)
s0_SquareBoard_Art_0__01.addComponent(new GLTFShape("unity_assets/s0_SquareBoard_Art_0__01.gltf"))
s0_SquareBoard_Art_0__01.getComponent(GLTFShape).withCollisions = false
s0_SquareBoard_Art_0__01.getComponent(Transform).rotation.set(0, -0.04199951, 0, -0.9991177)
var s0_SquareBoard_Art_1__01 = new Entity("SquareBoard_Art (1)")
s0_SquareBoard_Art_1__01.setParent(s0_Floor0_Boards_01)
s0_SquareBoard_Art_1__01.addComponent(new Transform({ position: new Vector3(19.27, 5.16, 45.24) }))
s0_SquareBoard_Art_1__01.getComponent(Transform).rotation.set(0, 0.9988683, 0, -0.04756111)
s0_SquareBoard_Art_1__01.getComponent(Transform).scale.set(0.9918963, 0.9918963, 0.9918963)
s0_SquareBoard_Art_1__01.addComponent(new GLTFShape("unity_assets/s0_SquareBoard_Art_0__01.gltf"))
s0_SquareBoard_Art_1__01.getComponent(GLTFShape).withCollisions = false
s0_SquareBoard_Art_1__01.getComponent(Transform).rotation.set(0, -0.04756115, 0, -0.9988683)
var s0_SquareBoard_Art_2__01 = new Entity("SquareBoard_Art (2)")
s0_SquareBoard_Art_2__01.setParent(s0_Floor0_Boards_01)
s0_SquareBoard_Art_2__01.addComponent(new Transform({ position: new Vector3(24.16527, 5.16, 44.40401) }))
s0_SquareBoard_Art_2__01.getComponent(Transform).rotation.set(0, 0.9930675, 0, -0.1175456)
s0_SquareBoard_Art_2__01.getComponent(Transform).scale.set(0.9918963, 0.9918963, 0.9918963)
s0_SquareBoard_Art_2__01.addComponent(new GLTFShape("unity_assets/s0_SquareBoard_Art_0__01.gltf"))
s0_SquareBoard_Art_2__01.getComponent(GLTFShape).withCollisions = false
s0_SquareBoard_Art_2__01.getComponent(Transform).rotation.set(0, -0.1175457, 0, -0.9930675)
var s0_SquareBoard_Art_3__01 = new Entity("SquareBoard_Art (3)")
s0_SquareBoard_Art_3__01.setParent(s0_Floor0_Boards_01)
s0_SquareBoard_Art_3__01.addComponent(new Transform({ position: new Vector3(28.9455, 5.16, 43.3014) }))
s0_SquareBoard_Art_3__01.getComponent(Transform).rotation.set(0, 0.9920661, 0, -0.1257175)
s0_SquareBoard_Art_3__01.getComponent(Transform).scale.set(0.9918963, 0.9918963, 0.9918963)
s0_SquareBoard_Art_3__01.addComponent(new GLTFShape("unity_assets/s0_SquareBoard_Art_0__01.gltf"))
s0_SquareBoard_Art_3__01.getComponent(GLTFShape).withCollisions = false
s0_SquareBoard_Art_3__01.getComponent(Transform).rotation.set(0, -0.1257175, 0, -0.9920661)
var s0_SquareBoard_Art_4__01 = new Entity("SquareBoard_Art (4)")
s0_SquareBoard_Art_4__01.setParent(s0_Floor0_Boards_01)
s0_SquareBoard_Art_4__01.addComponent(new Transform({ position: new Vector3(23.77, 4.34, 27.93) }))
s0_SquareBoard_Art_4__01.getComponent(Transform).rotation.set(0, 0.0008172867, 0, -0.9999996)
s0_SquareBoard_Art_4__01.getComponent(Transform).scale.set(0.9918963, 0.9918963, 0.9918963)
s0_SquareBoard_Art_4__01.addComponent(new GLTFShape("unity_assets/s0_SquareBoard_Art_0__01.gltf"))
s0_SquareBoard_Art_4__01.getComponent(GLTFShape).withCollisions = false
s0_SquareBoard_Art_4__01.getComponent(Transform).rotation.set(0, -0.9999996, 0, -0.000817243)
var s0_SquareBoard_Art_5__01 = new Entity("SquareBoard_Art (5)")
s0_SquareBoard_Art_5__01.setParent(s0_Floor0_Boards_01)
s0_SquareBoard_Art_5__01.addComponent(new Transform({ position: new Vector3(23.78309, 4.34, 20.20984) }))
s0_SquareBoard_Art_5__01.getComponent(Transform).rotation.set(0, 0.9999855, 0, 0.005393249)
s0_SquareBoard_Art_5__01.getComponent(Transform).scale.set(0.9918963, 0.9918963, 0.9918963)
s0_SquareBoard_Art_5__01.addComponent(new GLTFShape("unity_assets/s0_SquareBoard_Art_0__01.gltf"))
s0_SquareBoard_Art_5__01.getComponent(GLTFShape).withCollisions = false
s0_SquareBoard_Art_5__01.getComponent(Transform).rotation.set(0, 0.005393206, 0, -0.9999855)
var s0_SquareBoard_Art_6__01 = new Entity("SquareBoard_Art (6)")
s0_SquareBoard_Art_6__01.setParent(s0_Floor0_Boards_01)
s0_SquareBoard_Art_6__01.addComponent(new Transform({ position: new Vector3(27.62919, 4.34, 23.64523) }))
s0_SquareBoard_Art_6__01.getComponent(Transform).rotation.set(0, 0.7129869, 0, 0.7011773)
s0_SquareBoard_Art_6__01.getComponent(Transform).scale.set(0.9918963, 0.9918963, 0.9918963)
s0_SquareBoard_Art_6__01.addComponent(new GLTFShape("unity_assets/s0_SquareBoard_Art_0__01.gltf"))
s0_SquareBoard_Art_6__01.getComponent(GLTFShape).withCollisions = false
s0_SquareBoard_Art_6__01.getComponent(Transform).rotation.set(0, 0.7011772, 0, -0.712987)
var s0_SquareBoard_Art_7__01 = new Entity("SquareBoard_Art (7)")
s0_SquareBoard_Art_7__01.setParent(s0_Floor0_Boards_01)
s0_SquareBoard_Art_7__01.addComponent(new Transform({ position: new Vector3(28.48, 4.31, 2.04) }))
s0_SquareBoard_Art_7__01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_SquareBoard_Art_7__01.getComponent(Transform).scale.set(0.9918963, 0.9918963, 0.9918963)
s0_SquareBoard_Art_7__01.addComponent(new GLTFShape("unity_assets/s0_SquareBoard_Art_0__01.gltf"))
s0_SquareBoard_Art_7__01.getComponent(GLTFShape).withCollisions = false
s0_SquareBoard_Art_7__01.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_SquareBoard_Art_8__01 = new Entity("SquareBoard_Art (8)")
s0_SquareBoard_Art_8__01.setParent(s0_Floor0_Boards_01)
s0_SquareBoard_Art_8__01.addComponent(new Transform({ position: new Vector3(33.49, 4.31, 2.04) }))
s0_SquareBoard_Art_8__01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_SquareBoard_Art_8__01.getComponent(Transform).scale.set(0.9918963, 0.9918963, 0.9918963)
s0_SquareBoard_Art_8__01.addComponent(new GLTFShape("unity_assets/s0_SquareBoard_Art_0__01.gltf"))
s0_SquareBoard_Art_8__01.getComponent(GLTFShape).withCollisions = false
s0_SquareBoard_Art_8__01.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_Floor1_Boards_01 = new Entity("Floor1_Boards")
engine.addEntity(s0_Floor1_Boards_01)
s0_Floor1_Boards_01.addComponent(new Transform({ position: new Vector3(0, 0, 0) }))
s0_Floor1_Boards_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_Floor1_Boards_01.getComponent(Transform).scale.set(1, 1, 1)

var s0_SquareBoard_Art_7__02 = new Entity("SquareBoard_Art (7)")
s0_SquareBoard_Art_7__02.setParent(s0_Floor1_Boards_01)
s0_SquareBoard_Art_7__02.addComponent(new Transform({ position: new Vector3(40.20539, 11.08, 2.468735) }))
s0_SquareBoard_Art_7__02.getComponent(Transform).rotation.set(0, -0.1657777, 0, 0.9861632)
s0_SquareBoard_Art_7__02.getComponent(Transform).scale.set(0.9918963, 0.9918963, 0.9918963)
s0_SquareBoard_Art_7__02.addComponent(new GLTFShape("unity_assets/s0_SquareBoard_Art_0__01.gltf"))
s0_SquareBoard_Art_7__02.getComponent(GLTFShape).withCollisions = false
s0_SquareBoard_Art_7__02.getComponent(Transform).rotation.set(0, 0.9861632, 0, 0.1657776)
var s0_SquareBoard_Art_8__02 = new Entity("SquareBoard_Art (8)")
s0_SquareBoard_Art_8__02.setParent(s0_Floor1_Boards_01)
s0_SquareBoard_Art_8__02.addComponent(new Transform({ position: new Vector3(44.93, 11.07, 7.7) }))
s0_SquareBoard_Art_8__02.getComponent(Transform).rotation.set(0, -0.5775375, 0, 0.8163642)
s0_SquareBoard_Art_8__02.getComponent(Transform).scale.set(0.9918963, 0.9918963, 0.9918963)
s0_SquareBoard_Art_8__02.addComponent(new GLTFShape("unity_assets/s0_SquareBoard_Art_0__01.gltf"))
s0_SquareBoard_Art_8__02.getComponent(GLTFShape).withCollisions = false
s0_SquareBoard_Art_8__02.getComponent(Transform).rotation.set(0, 0.8163642, 0, 0.5775374)
var s0_SquareBoard_Art_9__01 = new Entity("SquareBoard_Art (9)")
s0_SquareBoard_Art_9__01.setParent(s0_Floor1_Boards_01)
s0_SquareBoard_Art_9__01.addComponent(new Transform({ position: new Vector3(40.21, 16.1, 2.7) }))
s0_SquareBoard_Art_9__01.getComponent(Transform).rotation.set(0.1287201, -0.1643608, 0.0216385, 0.9777262)
s0_SquareBoard_Art_9__01.getComponent(Transform).scale.set(0.9918963, 0.9918963, 0.9918963)
s0_SquareBoard_Art_9__01.addComponent(new GLTFShape("unity_assets/s0_SquareBoard_Art_0__01.gltf"))
s0_SquareBoard_Art_9__01.getComponent(GLTFShape).withCollisions = false
s0_SquareBoard_Art_9__01.getComponent(Transform).rotation.set(-0.02163851, 0.9777263, 0.1287201, 0.1643608)
var s0_SquareBoard_Art_10__01 = new Entity("SquareBoard_Art (10)")
s0_SquareBoard_Art_10__01.setParent(s0_Floor1_Boards_01)
s0_SquareBoard_Art_10__01.addComponent(new Transform({ position: new Vector3(44.55, 16.14, 7.83) }))
s0_SquareBoard_Art_10__01.getComponent(Transform).rotation.set(0.1065569, -0.5725962, 0.07538369, 0.8093804)
s0_SquareBoard_Art_10__01.getComponent(Transform).scale.set(0.9918963, 0.9918963, 0.9918963)
s0_SquareBoard_Art_10__01.addComponent(new GLTFShape("unity_assets/s0_SquareBoard_Art_0__01.gltf"))
s0_SquareBoard_Art_10__01.getComponent(GLTFShape).withCollisions = false
s0_SquareBoard_Art_10__01.getComponent(Transform).rotation.set(-0.07538374, 0.8093805, 0.106557, 0.5725962)
var s0_Floor3_Boards_01 = new Entity("Floor3_Boards")
engine.addEntity(s0_Floor3_Boards_01)
s0_Floor3_Boards_01.addComponent(new Transform({ position: new Vector3(0, 0, 0) }))
s0_Floor3_Boards_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_Floor3_Boards_01.getComponent(Transform).scale.set(1, 1, 1)

var s0_VerticalBoard_Art_01 = new Entity("VerticalBoard_Art")
s0_VerticalBoard_Art_01.setParent(s0_Floor3_Boards_01)
s0_VerticalBoard_Art_01.addComponent(new Transform({ position: new Vector3(2.76, 29.02, 10.13) }))
s0_VerticalBoard_Art_01.getComponent(Transform).rotation.set(0, 0.6197867, 0, 0.7847703)
s0_VerticalBoard_Art_01.getComponent(Transform).scale.set(1, 1, 1)
s0_VerticalBoard_Art_01.addComponent(new GLTFShape("unity_assets/s0_VerticalBoard_Art_01.gltf"))
s0_VerticalBoard_Art_01.getComponent(GLTFShape).withCollisions = false
s0_VerticalBoard_Art_01.getComponent(Transform).rotation.set(0, 0.7847703, 0, -0.6197868)
var s0_BigBoard_Art_01 = new Entity("BigBoard_Art")
s0_BigBoard_Art_01.setParent(s0_Floor3_Boards_01)
s0_BigBoard_Art_01.addComponent(new Transform({ position: new Vector3(6.1, 36.02319, 5.11) }))
s0_BigBoard_Art_01.getComponent(Transform).rotation.set(0.02983411, 0.3800007, -0.01226384, 0.9244236)
s0_BigBoard_Art_01.getComponent(Transform).scale.set(1, 1, 1)
s0_BigBoard_Art_01.addComponent(new GLTFShape("unity_assets/s0_BigBoard_Art_01.gltf"))
s0_BigBoard_Art_01.getComponent(GLTFShape).withCollisions = false
s0_BigBoard_Art_01.getComponent(Transform).rotation.set(0.01226384, 0.9244237, 0.02983411, -0.3800008)
var s0_HorizontalBoard_Art_01 = new Entity("HorizontalBoard_Art")
s0_HorizontalBoard_Art_01.setParent(s0_Floor3_Boards_01)
s0_HorizontalBoard_Art_01.addComponent(new Transform({ position: new Vector3(1.85, 34.99, 12.04) }))
s0_HorizontalBoard_Art_01.getComponent(Transform).rotation.set(0, 0.6427876, 0, 0.7660445)
s0_HorizontalBoard_Art_01.getComponent(Transform).scale.set(1, 1, 1)
s0_HorizontalBoard_Art_01.addComponent(new GLTFShape("unity_assets/s0_HorizontalBoard_Art_01.gltf"))
s0_HorizontalBoard_Art_01.getComponent(GLTFShape).withCollisions = false
s0_HorizontalBoard_Art_01.getComponent(Transform).rotation.set(0, 0.7660445, 0, -0.6427876)
var s0_HorizontalBoard_Art_1__01 = new Entity("HorizontalBoard_Art (1)")
s0_HorizontalBoard_Art_1__01.setParent(s0_Floor3_Boards_01)
s0_HorizontalBoard_Art_1__01.addComponent(new Transform({ position: new Vector3(2.57, 34.99, 18.71) }))
s0_HorizontalBoard_Art_1__01.getComponent(Transform).rotation.set(0, 0.7660444, 0, 0.6427876)
s0_HorizontalBoard_Art_1__01.getComponent(Transform).scale.set(1, 1, 1)
s0_HorizontalBoard_Art_1__01.addComponent(new GLTFShape("unity_assets/s0_HorizontalBoard_Art_01.gltf"))
s0_HorizontalBoard_Art_1__01.getComponent(GLTFShape).withCollisions = false
s0_HorizontalBoard_Art_1__01.getComponent(Transform).rotation.set(0, 0.6427876, 0, -0.7660444)
var s0_HorizontalBoard_Art_2__01 = new Entity("HorizontalBoard_Art (2)")
s0_HorizontalBoard_Art_2__01.setParent(s0_Floor3_Boards_01)
s0_HorizontalBoard_Art_2__01.addComponent(new Transform({ position: new Vector3(2.01, 39.55, 15.43) }))
s0_HorizontalBoard_Art_2__01.getComponent(Transform).rotation.set(0, 0.7071068, 0, 0.7071068)
s0_HorizontalBoard_Art_2__01.getComponent(Transform).scale.set(1, 1, 1)
s0_HorizontalBoard_Art_2__01.addComponent(new GLTFShape("unity_assets/s0_HorizontalBoard_Art_01.gltf"))
s0_HorizontalBoard_Art_2__01.getComponent(GLTFShape).withCollisions = false
s0_HorizontalBoard_Art_2__01.getComponent(Transform).rotation.set(0, 0.7071068, 0, -0.7071069)
var s0_VerticalBoard_Art_1__01 = new Entity("VerticalBoard_Art (1)")
s0_VerticalBoard_Art_1__01.setParent(s0_Floor3_Boards_01)
s0_VerticalBoard_Art_1__01.addComponent(new Transform({ position: new Vector3(11.82, 29.02, 1.81) }))
s0_VerticalBoard_Art_1__01.getComponent(Transform).rotation.set(0, 0.08765074, 0, 0.9961513)
s0_VerticalBoard_Art_1__01.getComponent(Transform).scale.set(1, 1, 1)
s0_VerticalBoard_Art_1__01.addComponent(new GLTFShape("unity_assets/s0_VerticalBoard_Art_01.gltf"))
s0_VerticalBoard_Art_1__01.getComponent(GLTFShape).withCollisions = false
s0_VerticalBoard_Art_1__01.getComponent(Transform).rotation.set(0, 0.9961513, 0, -0.08765078)
var s0_HorizontalBoard_Art_3__01 = new Entity("HorizontalBoard_Art (3)")
s0_HorizontalBoard_Art_3__01.setParent(s0_Floor3_Boards_01)
s0_HorizontalBoard_Art_3__01.addComponent(new Transform({ position: new Vector3(13.07, 34.99, 1.31) }))
s0_HorizontalBoard_Art_3__01.getComponent(Transform).rotation.set(0, 0.08198836, 0, 0.9966333)
s0_HorizontalBoard_Art_3__01.getComponent(Transform).scale.set(1, 1, 1)
s0_HorizontalBoard_Art_3__01.addComponent(new GLTFShape("unity_assets/s0_HorizontalBoard_Art_01.gltf"))
s0_HorizontalBoard_Art_3__01.getComponent(GLTFShape).withCollisions = false
s0_HorizontalBoard_Art_3__01.getComponent(Transform).rotation.set(0, 0.9966333, 0, -0.08198841)
var s0_HorizontalBoard_Art_4__01 = new Entity("HorizontalBoard_Art (4)")
s0_HorizontalBoard_Art_4__01.setParent(s0_Floor3_Boards_01)
s0_HorizontalBoard_Art_4__01.addComponent(new Transform({ position: new Vector3(22.2, 34.99, 1.4) }))
s0_HorizontalBoard_Art_4__01.getComponent(Transform).rotation.set(0, -0.006720754, 0, 0.9999774)
s0_HorizontalBoard_Art_4__01.getComponent(Transform).scale.set(1, 1, 1)
s0_HorizontalBoard_Art_4__01.addComponent(new GLTFShape("unity_assets/s0_HorizontalBoard_Art_01.gltf"))
s0_HorizontalBoard_Art_4__01.getComponent(GLTFShape).withCollisions = false
s0_HorizontalBoard_Art_4__01.getComponent(Transform).rotation.set(0, 0.9999774, 0, 0.00672071)
var s0_HorizontalBoard_Art_5__01 = new Entity("HorizontalBoard_Art (5)")
s0_HorizontalBoard_Art_5__01.setParent(s0_Floor3_Boards_01)
s0_HorizontalBoard_Art_5__01.addComponent(new Transform({ position: new Vector3(17.69, 39.23, 1.49) }))
s0_HorizontalBoard_Art_5__01.getComponent(Transform).rotation.set(0, 0.04497642, 0, 0.9989881)
s0_HorizontalBoard_Art_5__01.getComponent(Transform).scale.set(1, 1, 1)
s0_HorizontalBoard_Art_5__01.addComponent(new GLTFShape("unity_assets/s0_HorizontalBoard_Art_01.gltf"))
s0_HorizontalBoard_Art_5__01.getComponent(GLTFShape).withCollisions = false
s0_HorizontalBoard_Art_5__01.getComponent(Transform).rotation.set(0, 0.9989881, 0, -0.04497647)
var s0_VerticalBoard_Art_2__01 = new Entity("VerticalBoard_Art (2)")
s0_VerticalBoard_Art_2__01.setParent(s0_Floor3_Boards_01)
s0_VerticalBoard_Art_2__01.addComponent(new Transform({ position: new Vector3(11.84, 29.02, 1.87) }))
s0_VerticalBoard_Art_2__01.getComponent(Transform).rotation.set(0, 0.09952885, 0, 0.9950346)
s0_VerticalBoard_Art_2__01.getComponent(Transform).scale.set(1, 1, 1)
s0_VerticalBoard_Art_2__01.addComponent(new GLTFShape("unity_assets/s0_VerticalBoard_Art_01.gltf"))
s0_VerticalBoard_Art_2__01.getComponent(GLTFShape).withCollisions = false
s0_VerticalBoard_Art_2__01.getComponent(Transform).rotation.set(0, 0.9950346, 0, -0.09952889)
var s0_VerticalBoard_Art_3__01 = new Entity("VerticalBoard_Art (3)")
s0_VerticalBoard_Art_3__01.setParent(s0_Floor3_Boards_01)
s0_VerticalBoard_Art_3__01.addComponent(new Transform({ position: new Vector3(23.28, 29.02, 1.55) }))
s0_VerticalBoard_Art_3__01.getComponent(Transform).rotation.set(0, 0.02111038, 0, 0.9997771)
s0_VerticalBoard_Art_3__01.getComponent(Transform).scale.set(1, 1, 1)
s0_VerticalBoard_Art_3__01.addComponent(new GLTFShape("unity_assets/s0_VerticalBoard_Art_01.gltf"))
s0_VerticalBoard_Art_3__01.getComponent(GLTFShape).withCollisions = false
s0_VerticalBoard_Art_3__01.getComponent(Transform).rotation.set(0, 0.9997771, 0, -0.02111042)
var s0_Floor4_Boards_01 = new Entity("Floor4_Boards")
engine.addEntity(s0_Floor4_Boards_01)
s0_Floor4_Boards_01.addComponent(new Transform({ position: new Vector3(41.86, 38.8, 43.53) }))
s0_Floor4_Boards_01.getComponent(Transform).rotation.set(0, -0.9550709, 0, 0.2963778)
s0_Floor4_Boards_01.getComponent(Transform).scale.set(1, 1, 1)

var s0_SquareBoard_Art_02 = new Entity("SquareBoard_Art")
s0_SquareBoard_Art_02.setParent(s0_Floor4_Boards_01)
s0_SquareBoard_Art_02.addComponent(new Transform({ position: new Vector3(0, 0, 0) }))
s0_SquareBoard_Art_02.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_SquareBoard_Art_02.getComponent(Transform).scale.set(1, 1, 1)
s0_SquareBoard_Art_02.addComponent(new GLTFShape("unity_assets/s0_SquareBoard_Art_0__01.gltf"))
s0_SquareBoard_Art_02.getComponent(GLTFShape).withCollisions = false
s0_SquareBoard_Art_02.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_SquareBoard_Art_1__02 = new Entity("SquareBoard_Art (1)")
s0_SquareBoard_Art_1__02.setParent(s0_Floor4_Boards_01)
s0_SquareBoard_Art_1__02.addComponent(new Transform({ position: new Vector3(4.45, 0.03, 1.29) }))
s0_SquareBoard_Art_1__02.getComponent(Transform).rotation.set(0, -0.2055716, 0, 0.9786422)
s0_SquareBoard_Art_1__02.getComponent(Transform).scale.set(1, 1, 1)
s0_SquareBoard_Art_1__02.addComponent(new GLTFShape("unity_assets/s0_SquareBoard_Art_0__01.gltf"))
s0_SquareBoard_Art_1__02.getComponent(GLTFShape).withCollisions = false
s0_SquareBoard_Art_1__02.getComponent(Transform).rotation.set(0, 0.9786422, 0, 0.2055715)
var s0_Floor4_Boards_1__01 = new Entity("Floor4_Boards (1)")
engine.addEntity(s0_Floor4_Boards_1__01)
s0_Floor4_Boards_1__01.addComponent(new Transform({ position: new Vector3(44.68, 38.8, 39.93) }))
s0_Floor4_Boards_1__01.getComponent(Transform).rotation.set(0, -0.7918628, 0, 0.6106991)
s0_Floor4_Boards_1__01.getComponent(Transform).scale.set(1, 1, 1)

var s0_SquareBoard_Art_01 = new Entity("SquareBoard_Art")
s0_SquareBoard_Art_01.setParent(s0_Floor4_Boards_1__01)
s0_SquareBoard_Art_01.addComponent(new Transform({ position: new Vector3(0, 0, 0) }))
s0_SquareBoard_Art_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_SquareBoard_Art_01.getComponent(Transform).scale.set(1, 1, 1)
s0_SquareBoard_Art_01.addComponent(new GLTFShape("unity_assets/s0_SquareBoard_Art_0__01.gltf"))
s0_SquareBoard_Art_01.getComponent(GLTFShape).withCollisions = false
s0_SquareBoard_Art_01.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_Floor4_Boards_2__01 = new Entity("Floor4_Boards (2)")
engine.addEntity(s0_Floor4_Boards_2__01)
s0_Floor4_Boards_2__01.addComponent(new Transform({ position: new Vector3(45.33, 38.8, 34.78) }))
s0_Floor4_Boards_2__01.getComponent(Transform).rotation.set(0, -0.7412956, 0, 0.6711787)
s0_Floor4_Boards_2__01.getComponent(Transform).scale.set(1, 1, 1)

var s0_SquareBoard_Art_03 = new Entity("SquareBoard_Art")
s0_SquareBoard_Art_03.setParent(s0_Floor4_Boards_2__01)
s0_SquareBoard_Art_03.addComponent(new Transform({ position: new Vector3(0, 0, 0) }))
s0_SquareBoard_Art_03.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_SquareBoard_Art_03.getComponent(Transform).scale.set(1, 1, 1)
s0_SquareBoard_Art_03.addComponent(new GLTFShape("unity_assets/s0_SquareBoard_Art_0__01.gltf"))
s0_SquareBoard_Art_03.getComponent(GLTFShape).withCollisions = false
s0_SquareBoard_Art_03.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_TPTargets_01 = new Entity("TP Targets")
engine.addEntity(s0_TPTargets_01)
s0_TPTargets_01.addComponent(new Transform({ position: new Vector3(23.597, -1.144891, 22.7475) }))
s0_TPTargets_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_TPTargets_01.getComponent(Transform).scale.set(1, 1, 1)

var s0_Lobby_01 = new Entity("Lobby")
s0_Lobby_01.setParent(s0_TPTargets_01)
s0_Lobby_01.addComponent(new Transform({ position: new Vector3(-12.25, 4.15, 1.14) }))
s0_Lobby_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_Lobby_01.getComponent(Transform).scale.set(1, 1, 1)

var s0_Floor_02_02 = new Entity("Floor_02")
s0_Floor_02_02.setParent(s0_TPTargets_01)
s0_Floor_02_02.addComponent(new Transform({ position: new Vector3(-5.809999, 18.59, 8.68) }))
s0_Floor_02_02.getComponent(Transform).rotation.set(0, 0.9408399, 0, 0.3388513)
s0_Floor_02_02.getComponent(Transform).scale.set(1, 1, 1)

var s0_Floor_01_02 = new Entity("Floor_01")
s0_Floor_01_02.setParent(s0_TPTargets_01)
s0_Floor_01_02.addComponent(new Transform({ position: new Vector3(5.1, 11.46, -6.72) }))
s0_Floor_01_02.getComponent(Transform).rotation.set(0, 0.9156699, 0, 0.4019312)
s0_Floor_01_02.getComponent(Transform).scale.set(1, 1, 1)

var s0_Floor_03_02 = new Entity("Floor_03")
s0_Floor_03_02.setParent(s0_TPTargets_01)
s0_Floor_03_02.addComponent(new Transform({ position: new Vector3(-4.84, 28.1, -4.23) }))
s0_Floor_03_02.getComponent(Transform).rotation.set(0, 0.9156699, 0, 0.4019312)
s0_Floor_03_02.getComponent(Transform).scale.set(1, 1, 1)

var s0_Floor_04_02 = new Entity("Floor_04")
s0_Floor_04_02.setParent(s0_TPTargets_01)
s0_Floor_04_02.addComponent(new Transform({ position: new Vector3(5.3, 37.61, 6.8) }))
s0_Floor_04_02.getComponent(Transform).rotation.set(0, 0.9156699, 0, 0.4019312)
s0_Floor_04_02.getComponent(Transform).scale.set(1, 1, 1)

var s0_TP_Box_Lobby_01 = new Entity("TP_Box_Lobby")
s0_TP_Box_Lobby_01.setParent(s0_TPTargets_01)
s0_TP_Box_Lobby_01.addComponent(new Transform({ position: new Vector3(0, 0.70841, 0.01) }))
s0_TP_Box_Lobby_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_TP_Box_Lobby_01.getComponent(Transform).scale.set(1, 0.85991, 1)

var s0_1thFloor_TPBox_01 = new Entity("1stFloor_TPBox")
s0_1thFloor_TPBox_01.setParent(s0_TP_Box_Lobby_01)
s0_1thFloor_TPBox_01.addComponent(new Transform({ position: new Vector3(-2.72, 4.046, 1.26) }))
s0_1thFloor_TPBox_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_1thFloor_TPBox_01.getComponent(Transform).scale.set(1, 0.80705, 2.2091)
s0_1thFloor_TPBox_01.addComponent(new Teleport({clickEntity:s0_1thFloor_TPBox_01, targetLocation: new Vector3(28.697, 10.31511, 16.0275), hoverText:"1st Floor", trigger:null, camaraTarget: null, enableTeleportLoop:false, enableDebug:false, delayTeleport:0})) 
s0_1thFloor_TPBox_01.addComponent(new GLTFShape("unity_assets/s0_1thFloor_TPBox_01.gltf"))
s0_1thFloor_TPBox_01.getComponent(GLTFShape).withCollisions = false
s0_1thFloor_TPBox_01.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_2thFloor_TPBox_01 = new Entity("2ndFloor_TPBox")
s0_2thFloor_TPBox_01.setParent(s0_TP_Box_Lobby_01)
s0_2thFloor_TPBox_01.addComponent(new Transform({ position: new Vector3(-2.72, 5.16, 1.26) }))
s0_2thFloor_TPBox_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_2thFloor_TPBox_01.getComponent(Transform).scale.set(1, 0.80705, 2.2091)
s0_2thFloor_TPBox_01.addComponent(new Teleport({clickEntity:s0_2thFloor_TPBox_01, targetLocation: new Vector3(17.787, 17.44511, 31.4275), hoverText:"2nd Floor", trigger:null, camaraTarget: null, enableTeleportLoop:false, enableDebug:false, delayTeleport:0})) 
s0_2thFloor_TPBox_01.addComponent(new GLTFShape("unity_assets/s0_2thFloor_TPBox_01.gltf"))
s0_2thFloor_TPBox_01.getComponent(GLTFShape).withCollisions = false
s0_2thFloor_TPBox_01.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_3thFloor_TPBox_01 = new Entity("3rdFloor_TPBox")
s0_3thFloor_TPBox_01.setParent(s0_TP_Box_Lobby_01)
s0_3thFloor_TPBox_01.addComponent(new Transform({ position: new Vector3(-2.72, 6.2, 1.26) }))
s0_3thFloor_TPBox_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_3thFloor_TPBox_01.getComponent(Transform).scale.set(1, 0.80705, 2.2091)
s0_3thFloor_TPBox_01.addComponent(new Teleport({clickEntity:s0_3thFloor_TPBox_01, targetLocation: new Vector3(18.757, 26.95511, 18.5175), hoverText:"3rd Floor", trigger:null, camaraTarget: null, enableTeleportLoop:false, enableDebug:false, delayTeleport:0})) 
s0_3thFloor_TPBox_01.addComponent(new GLTFShape("unity_assets/s0_3thFloor_TPBox_01.gltf"))
s0_3thFloor_TPBox_01.getComponent(GLTFShape).withCollisions = false
s0_3thFloor_TPBox_01.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_4thFloor_TPBox_01 = new Entity("4thFloor_TPBox")
s0_4thFloor_TPBox_01.setParent(s0_TP_Box_Lobby_01)
s0_4thFloor_TPBox_01.addComponent(new Transform({ position: new Vector3(-2.72, 7.29, 1.26) }))
s0_4thFloor_TPBox_01.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_4thFloor_TPBox_01.getComponent(Transform).scale.set(1, 0.80705, 2.2091)
s0_4thFloor_TPBox_01.addComponent(new Teleport({clickEntity:s0_4thFloor_TPBox_01, targetLocation: new Vector3(28.897, 36.46511, 29.5475), hoverText:"4th Floor", trigger:null, camaraTarget: null, enableTeleportLoop:false, enableDebug:false, delayTeleport:0})) 
s0_4thFloor_TPBox_01.addComponent(new GLTFShape("unity_assets/s0_4thFloor_TPBox_01.gltf"))
s0_4thFloor_TPBox_01.getComponent(GLTFShape).withCollisions = false
s0_4thFloor_TPBox_01.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_TP_Box_Lobby_1__01 = new Entity("TP_Box_Lobby (1)")
s0_TP_Box_Lobby_1__01.setParent(s0_TPTargets_01)
s0_TP_Box_Lobby_1__01.addComponent(new Transform({ position: new Vector3(1.32, 7.47, -5.242) }))
s0_TP_Box_Lobby_1__01.getComponent(Transform).rotation.set(0, 0.5842659, 0, 0.8115622)
s0_TP_Box_Lobby_1__01.getComponent(Transform).scale.set(1, 0.84613, 1)

var s0_Lobby_TPBox_02 = new Entity("Lobby_TPBox")
s0_Lobby_TPBox_02.setParent(s0_TP_Box_Lobby_1__01)
s0_Lobby_TPBox_02.addComponent(new Transform({ position: new Vector3(-2.85, 3.061, 1.26) }))
s0_Lobby_TPBox_02.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_Lobby_TPBox_02.getComponent(Transform).scale.set(1, 0.7213, 2.2091)
s0_Lobby_TPBox_02.addComponent(new Teleport({clickEntity:s0_Lobby_TPBox_02, targetLocation: new Vector3(11.347, 3.005109, 23.8875), hoverText:"Lobby", trigger:null, camaraTarget: null, enableTeleportLoop:false, enableDebug:false, delayTeleport:0})) 
s0_Lobby_TPBox_02.addComponent(new GLTFShape("unity_assets/s0_Lobby_TPBox_02.gltf"))
s0_Lobby_TPBox_02.getComponent(GLTFShape).withCollisions = false
s0_Lobby_TPBox_02.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_2thFloor_TPBox_02 = new Entity("2ndFloor_TPBox")
s0_2thFloor_TPBox_02.setParent(s0_TP_Box_Lobby_1__01)
s0_2thFloor_TPBox_02.addComponent(new Transform({ position: new Vector3(-2.95, 5.096, 1.26) }))
s0_2thFloor_TPBox_02.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_2thFloor_TPBox_02.getComponent(Transform).scale.set(1, 0.80705, 2.2091)
s0_2thFloor_TPBox_02.addComponent(new Teleport({clickEntity:s0_2thFloor_TPBox_02, targetLocation: new Vector3(17.787, 17.44511, 31.4275), hoverText:"2nd Floor", trigger:null, camaraTarget: null, enableTeleportLoop:false, enableDebug:false, delayTeleport:0})) 
s0_2thFloor_TPBox_02.addComponent(new GLTFShape("unity_assets/s0_2thFloor_TPBox_02.gltf"))
s0_2thFloor_TPBox_02.getComponent(GLTFShape).withCollisions = false
s0_2thFloor_TPBox_02.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_3thFloor_TPBox_02 = new Entity("3rdFloor_TPBox")
s0_3thFloor_TPBox_02.setParent(s0_TP_Box_Lobby_1__01)
s0_3thFloor_TPBox_02.addComponent(new Transform({ position: new Vector3(-2.72, 6.098, 1.26) }))
s0_3thFloor_TPBox_02.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_3thFloor_TPBox_02.getComponent(Transform).scale.set(1, 0.80705, 2.2091)
s0_3thFloor_TPBox_02.addComponent(new Teleport({clickEntity:s0_3thFloor_TPBox_02, targetLocation: new Vector3(18.757, 26.95511, 18.5175), hoverText:"3rd Floor", trigger:null, camaraTarget: null, enableTeleportLoop:false, enableDebug:false, delayTeleport:0})) 
s0_3thFloor_TPBox_02.addComponent(new GLTFShape("unity_assets/s0_3thFloor_TPBox_02.gltf"))
s0_3thFloor_TPBox_02.getComponent(GLTFShape).withCollisions = false
s0_3thFloor_TPBox_02.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_4thFloor_TPBox_02 = new Entity("4thFloor_TPBox")
s0_4thFloor_TPBox_02.setParent(s0_TP_Box_Lobby_1__01)
s0_4thFloor_TPBox_02.addComponent(new Transform({ position: new Vector3(-2.3, 7.01, 1.26) }))
s0_4thFloor_TPBox_02.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_4thFloor_TPBox_02.getComponent(Transform).scale.set(1, 0.80705, 2.2091)
s0_4thFloor_TPBox_02.addComponent(new Teleport({clickEntity:s0_4thFloor_TPBox_02, targetLocation: new Vector3(28.897, 36.46511, 29.5475), hoverText:"4th Floor", trigger:null, camaraTarget: null, enableTeleportLoop:false, enableDebug:false, delayTeleport:0})) 
s0_4thFloor_TPBox_02.addComponent(new GLTFShape("unity_assets/s0_4thFloor_TPBox_02.gltf"))
s0_4thFloor_TPBox_02.getComponent(GLTFShape).withCollisions = false
s0_4thFloor_TPBox_02.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_TP_Box_Lobby_2__01 = new Entity("TP_Box_Lobby (2)")
s0_TP_Box_Lobby_2__01.setParent(s0_TPTargets_01)
s0_TP_Box_Lobby_2__01.addComponent(new Transform({ position: new Vector3(-1.17, 13.727, 0.97) }))
s0_TP_Box_Lobby_2__01.getComponent(Transform).rotation.set(0, 0.4105793, 0, 0.9118249)
s0_TP_Box_Lobby_2__01.getComponent(Transform).scale.set(1, 0.94914, 1)

var s0_Lobby_TPBox_03 = new Entity("Lobby_TPBox")
s0_Lobby_TPBox_03.setParent(s0_TP_Box_Lobby_2__01)
s0_Lobby_TPBox_03.addComponent(new Transform({ position: new Vector3(-2.72, 3.061, 1.26) }))
s0_Lobby_TPBox_03.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_Lobby_TPBox_03.getComponent(Transform).scale.set(1, 0.7213, 2.2091)
s0_Lobby_TPBox_03.addComponent(new Teleport({clickEntity:s0_Lobby_TPBox_03, targetLocation: new Vector3(11.347, 3.005109, 23.8875), hoverText:"Lobby", trigger:null, camaraTarget: null, enableTeleportLoop:false, enableDebug:false, delayTeleport:0})) 
s0_Lobby_TPBox_03.addComponent(new GLTFShape("unity_assets/s0_Lobby_TPBox_03.gltf"))
s0_Lobby_TPBox_03.getComponent(GLTFShape).withCollisions = false
s0_Lobby_TPBox_03.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_1thFloor_TPBox_03 = new Entity("1stFloor_TPBox")
s0_1thFloor_TPBox_03.setParent(s0_TP_Box_Lobby_2__01)
s0_1thFloor_TPBox_03.addComponent(new Transform({ position: new Vector3(-2.66, 4.046, 1.26) }))
s0_1thFloor_TPBox_03.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_1thFloor_TPBox_03.getComponent(Transform).scale.set(1, 0.80705, 2.2091)
s0_1thFloor_TPBox_03.addComponent(new Teleport({clickEntity:s0_1thFloor_TPBox_03, targetLocation: new Vector3(28.697, 10.31511, 16.0275), hoverText:"1st Floor", trigger:null, camaraTarget: null, enableTeleportLoop:false, enableDebug:false, delayTeleport:0})) 
s0_1thFloor_TPBox_03.addComponent(new GLTFShape("unity_assets/s0_1thFloor_TPBox_03.gltf"))
s0_1thFloor_TPBox_03.getComponent(GLTFShape).withCollisions = false
s0_1thFloor_TPBox_03.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_3thFloor_TPBox_03 = new Entity("3rdFloor_TPBox")
s0_3thFloor_TPBox_03.setParent(s0_TP_Box_Lobby_2__01)
s0_3thFloor_TPBox_03.addComponent(new Transform({ position: new Vector3(-2.84, 6.098, 1.26) }))
s0_3thFloor_TPBox_03.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_3thFloor_TPBox_03.getComponent(Transform).scale.set(1, 0.80705, 2.2091)
s0_3thFloor_TPBox_03.addComponent(new Teleport({clickEntity:s0_3thFloor_TPBox_03, targetLocation: new Vector3(18.757, 26.95511, 18.5175), hoverText:"3rd Floor", trigger:null, camaraTarget: null, enableTeleportLoop:false, enableDebug:false, delayTeleport:0})) 
s0_3thFloor_TPBox_03.addComponent(new GLTFShape("unity_assets/s0_3thFloor_TPBox_03.gltf"))
s0_3thFloor_TPBox_03.getComponent(GLTFShape).withCollisions = false
s0_3thFloor_TPBox_03.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_4thFloor_TPBox_03 = new Entity("4thFloor_TPBox")
s0_4thFloor_TPBox_03.setParent(s0_TP_Box_Lobby_2__01)
s0_4thFloor_TPBox_03.addComponent(new Transform({ position: new Vector3(-3.08, 7.09, 1.26) }))
s0_4thFloor_TPBox_03.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_4thFloor_TPBox_03.getComponent(Transform).scale.set(1, 0.8879971, 2.2091)
s0_4thFloor_TPBox_03.addComponent(new Teleport({clickEntity:s0_4thFloor_TPBox_03, targetLocation: new Vector3(28.897, 36.46511, 29.5475), hoverText:"4th Floor", trigger:null, camaraTarget: null, enableTeleportLoop:false, enableDebug:false, delayTeleport:0})) 
s0_4thFloor_TPBox_03.addComponent(new GLTFShape("unity_assets/s0_4thFloor_TPBox_03.gltf"))
s0_4thFloor_TPBox_03.getComponent(GLTFShape).withCollisions = false
s0_4thFloor_TPBox_03.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_TP_Box_Lobby_3__01 = new Entity("TP_Box_Lobby (3)")
s0_TP_Box_Lobby_3__01.setParent(s0_TPTargets_01)
s0_TP_Box_Lobby_3__01.addComponent(new Transform({ position: new Vector3(-0.81, 22.96, -0.07) }))
s0_TP_Box_Lobby_3__01.getComponent(Transform).rotation.set(0, -0.02222084, 0, 0.9997531)
s0_TP_Box_Lobby_3__01.getComponent(Transform).scale.set(1, 1, 1)

var s0_Lobby_TPBox_04 = new Entity("Lobby_TPBox")
s0_Lobby_TPBox_04.setParent(s0_TP_Box_Lobby_3__01)
s0_Lobby_TPBox_04.addComponent(new Transform({ position: new Vector3(-2.72, 3.061, 1.26) }))
s0_Lobby_TPBox_04.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_Lobby_TPBox_04.getComponent(Transform).scale.set(1, 0.7213, 2.2091)
s0_Lobby_TPBox_04.addComponent(new Teleport({clickEntity:s0_Lobby_TPBox_04, targetLocation: new Vector3(11.347, 3.005109, 23.8875), hoverText:"Lobby", trigger:null, camaraTarget: null, enableTeleportLoop:false, enableDebug:false, delayTeleport:0})) 
s0_Lobby_TPBox_04.addComponent(new GLTFShape("unity_assets/s0_Lobby_TPBox_04.gltf"))
s0_Lobby_TPBox_04.getComponent(GLTFShape).withCollisions = false
s0_Lobby_TPBox_04.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_1thFloor_TPBox_04 = new Entity("1stFloor_TPBox")
s0_1thFloor_TPBox_04.setParent(s0_TP_Box_Lobby_3__01)
s0_1thFloor_TPBox_04.addComponent(new Transform({ position: new Vector3(-2.72, 4.046, 1.26) }))
s0_1thFloor_TPBox_04.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_1thFloor_TPBox_04.getComponent(Transform).scale.set(1, 0.80705, 2.2091)
s0_1thFloor_TPBox_04.addComponent(new Teleport({clickEntity:s0_1thFloor_TPBox_04, targetLocation: new Vector3(28.697, 10.31511, 16.0275), hoverText:"1st Floor", trigger:null, camaraTarget: null, enableTeleportLoop:false, enableDebug:false, delayTeleport:0})) 
s0_1thFloor_TPBox_04.addComponent(new GLTFShape("unity_assets/s0_1thFloor_TPBox_04.gltf"))
s0_1thFloor_TPBox_04.getComponent(GLTFShape).withCollisions = false
s0_1thFloor_TPBox_04.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_2thFloor_TPBox_04 = new Entity("2ndFloor_TPBox")
s0_2thFloor_TPBox_04.setParent(s0_TP_Box_Lobby_3__01)
s0_2thFloor_TPBox_04.addComponent(new Transform({ position: new Vector3(-2.45, 5.096, 1.26) }))
s0_2thFloor_TPBox_04.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_2thFloor_TPBox_04.getComponent(Transform).scale.set(1, 0.80705, 2.2091)
s0_2thFloor_TPBox_04.addComponent(new Teleport({clickEntity:s0_2thFloor_TPBox_04, targetLocation: new Vector3(17.787, 17.44511, 31.4275), hoverText:"2nd Floor", trigger:null, camaraTarget: null, enableTeleportLoop:false, enableDebug:false, delayTeleport:0})) 
s0_2thFloor_TPBox_04.addComponent(new GLTFShape("unity_assets/s0_2thFloor_TPBox_04.gltf"))
s0_2thFloor_TPBox_04.getComponent(GLTFShape).withCollisions = false
s0_2thFloor_TPBox_04.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_4thFloor_TPBox_04 = new Entity("4thFloor_TPBox")
s0_4thFloor_TPBox_04.setParent(s0_TP_Box_Lobby_3__01)
s0_4thFloor_TPBox_04.addComponent(new Transform({ position: new Vector3(-3.012, 6.927, 1.26) }))
s0_4thFloor_TPBox_04.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_4thFloor_TPBox_04.getComponent(Transform).scale.set(1, 0.80705, 2.2091)
s0_4thFloor_TPBox_04.addComponent(new Teleport({clickEntity:s0_4thFloor_TPBox_04, targetLocation: new Vector3(28.897, 36.46511, 29.5475), hoverText:"4th Floor", trigger:null, camaraTarget: null, enableTeleportLoop:false, enableDebug:false, delayTeleport:0})) 
s0_4thFloor_TPBox_04.addComponent(new GLTFShape("unity_assets/s0_4thFloor_TPBox_04.gltf"))
s0_4thFloor_TPBox_04.getComponent(GLTFShape).withCollisions = false
s0_4thFloor_TPBox_04.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_TP_Box_Lobby_4__01 = new Entity("TP_Box_Lobby (4)")
s0_TP_Box_Lobby_4__01.setParent(s0_TPTargets_01)
s0_TP_Box_Lobby_4__01.addComponent(new Transform({ position: new Vector3(7.1, 32.65, 0.9) }))
s0_TP_Box_Lobby_4__01.getComponent(Transform).rotation.set(0, -0.07413275, 0, 0.9972484)
s0_TP_Box_Lobby_4__01.getComponent(Transform).scale.set(1, 1, 1)

var s0_Lobby_TPBox_05 = new Entity("Lobby_TPBox")
s0_Lobby_TPBox_05.setParent(s0_TP_Box_Lobby_4__01)
s0_Lobby_TPBox_05.addComponent(new Transform({ position: new Vector3(-2.72, 3.061, 1.26) }))
s0_Lobby_TPBox_05.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_Lobby_TPBox_05.getComponent(Transform).scale.set(1, 0.7213, 2.2091)
s0_Lobby_TPBox_05.addComponent(new Teleport({clickEntity:s0_Lobby_TPBox_05, targetLocation: new Vector3(11.347, 3.005109, 23.8875), hoverText:"Lobby", trigger:null, camaraTarget: null, enableTeleportLoop:false, enableDebug:false, delayTeleport:0})) 
s0_Lobby_TPBox_05.addComponent(new GLTFShape("unity_assets/s0_Lobby_TPBox_05.gltf"))
s0_Lobby_TPBox_05.getComponent(GLTFShape).withCollisions = false
s0_Lobby_TPBox_05.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_1thFloor_TPBox_05 = new Entity("1stFloor_TPBox")
s0_1thFloor_TPBox_05.setParent(s0_TP_Box_Lobby_4__01)
s0_1thFloor_TPBox_05.addComponent(new Transform({ position: new Vector3(-2.72, 4.046, 1.26) }))
s0_1thFloor_TPBox_05.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_1thFloor_TPBox_05.getComponent(Transform).scale.set(1, 0.80705, 2.2091)
s0_1thFloor_TPBox_05.addComponent(new Teleport({clickEntity:s0_1thFloor_TPBox_05, targetLocation: new Vector3(28.697, 10.31511, 16.0275), hoverText:"1st Floor", trigger:null, camaraTarget: null, enableTeleportLoop:false, enableDebug:false, delayTeleport:0})) 
s0_1thFloor_TPBox_05.addComponent(new GLTFShape("unity_assets/s0_1thFloor_TPBox_05.gltf"))
s0_1thFloor_TPBox_05.getComponent(GLTFShape).withCollisions = false
s0_1thFloor_TPBox_05.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_2thFloor_TPBox_05 = new Entity("2ndFloor_TPBox")
s0_2thFloor_TPBox_05.setParent(s0_TP_Box_Lobby_4__01)
s0_2thFloor_TPBox_05.addComponent(new Transform({ position: new Vector3(-3.152, 5.096, 1.26) }))
s0_2thFloor_TPBox_05.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_2thFloor_TPBox_05.getComponent(Transform).scale.set(1, 0.80705, 2.2091)
s0_2thFloor_TPBox_05.addComponent(new Teleport({clickEntity:s0_2thFloor_TPBox_05, targetLocation: new Vector3(17.787, 17.44511, 31.4275), hoverText:"2nd Floor", trigger:null, camaraTarget: null, enableTeleportLoop:false, enableDebug:false, delayTeleport:0})) 
s0_2thFloor_TPBox_05.addComponent(new GLTFShape("unity_assets/s0_2thFloor_TPBox_05.gltf"))
s0_2thFloor_TPBox_05.getComponent(GLTFShape).withCollisions = false
s0_2thFloor_TPBox_05.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)
var s0_3thFloor_TPBox_05 = new Entity("3rdFloor_TPBox")
s0_3thFloor_TPBox_05.setParent(s0_TP_Box_Lobby_4__01)
s0_3thFloor_TPBox_05.addComponent(new Transform({ position: new Vector3(-3.119, 6.098, 1.26) }))
s0_3thFloor_TPBox_05.getComponent(Transform).rotation.set(0, 0, 0, 1)
s0_3thFloor_TPBox_05.getComponent(Transform).scale.set(1, 0.80705, 2.2091)
s0_3thFloor_TPBox_05.addComponent(new Teleport({clickEntity:s0_3thFloor_TPBox_05, targetLocation: new Vector3(18.757, 26.95511, 18.5175), hoverText:"3rd Floor", trigger:null, camaraTarget: null, enableTeleportLoop:false, enableDebug:false, delayTeleport:0})) 
s0_3thFloor_TPBox_05.addComponent(new GLTFShape("unity_assets/s0_3thFloor_TPBox_05.gltf"))
s0_3thFloor_TPBox_05.getComponent(GLTFShape).withCollisions = false
s0_3thFloor_TPBox_05.getComponent(Transform).rotation.set(0, 1, 0, -4.371139E-08)

