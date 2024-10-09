import MESSAGE from "../../../server/rooms/mesages";
import {globalStore} from "../services/globalStore/globalStore";
import {getCurrentRealm} from "@decentraland/EnvironmentAPI";
import {getGLTFShape} from "../../golfplay/services/resource-repo";
import {getTierColor, getTierFromSub, tryFn} from "../../../common/utils";
import {seasonTierDefinitions} from "../../../common/season-tier-definitions";
const attached = {
    //address - {address,entity,golfclubId,tier}
}
//TODO REMOVE WS APPROACH AND USE P2P MESSAGE_BUS

export const handleAttachments = () => {
    const sceneMessageBus = new MessageBus();
    const {userId, activeGolfClubTokenId, golfclubs, displayName} = globalStore.userData.getState();
    const golfClubId =getGolfclubIdFromTokenId(activeGolfClubTokenId, golfclubs);
    const tier = getTierFromSub(globalStore.userData.getState()["statistic_tier-sub"]);
    console.log("EMIT ATTACHMENT",{golfClubId, userId, tier, displayName});
    sceneMessageBus.emit("attachment", {
        tier,
        golfClubId,
        address:userId,
        displayName
    });
    attached[userId] = {
        tier,
        address:userId,
        golfClubId,
        displayName
    };
    addAvatarRankLabel({tier, address:userId});
    sceneMessageBus.on("attachment", ({golfClubId, address, tier, displayName})=>{
        console.log("ON ATTACHMENT",{golfClubId, address, tier, displayName});
        if(!attached[address]){
            attached[address] = {
                tier,
                address,
                golfClubId
            };
            if(tier){
                addAvatarRankLabel({tier, address});
            }

            sceneMessageBus.emit("attachment", {
                tier:getTierFromSub(globalStore.userData.getState()["statistic_tier-sub"]),
                golfClubId:getGolfclubIdFromTokenId(activeGolfClubTokenId, golfclubs),
                address:userId,
                displayName:globalStore.userData.getState().displayName
            });
        }
    });
}

export const handleAttachedGolfclubs = async (lobbyRoom) => {
    //TODO when new user joins, if same realm (and isle?), create new entity and attach
    const {userId, activeGolfClubTokenId, golfclubs} = globalStore.userData.getState();
    const realm = (await getCurrentRealm()).displayName;
    const userGolfclubId =getGolfclubIdFromTokenId(activeGolfClubTokenId, golfclubs);

    globalStore.userData.onChange(({newValue, oldValue, prop})=>{
        console.log("changed activeGolfClubTokenId", prop, newValue, oldValue);
        const golfClubId = getGolfclubIdFromTokenId(newValue, golfclubs);
        if(isNFTGolfclub(golfClubId)) {
            lobbyRoom.send(MESSAGE.ACTIVE_GOLFCLUB,golfClubId)
        }
    },"activeGolfClubTokenId");
    globalStore.game.onChange(({newValue, oldValue, prop})=>{
        if(newValue && !oldValue){
            Object.values(attached).forEach(aPlayer => {
                const shape = aPlayer.entity?.getComponent(GLTFShape);
                if(shape) shape.visible = false
            })
        }else if(!newValue && oldValue){
            Object.values(attached).forEach(aPlayer => {
                const shape = aPlayer.entity?.getComponent(GLTFShape);
                if(shape) shape.visible = true
            })
        }
    }, "playing")

    console.log("players",lobbyRoom.state.players);

    const serverOwnPlayer = lobbyRoom.state.players.get(lobbyRoom.sessionId);
    serverOwnPlayer.onChange = (changes)=>{
        console.log("changed own player activeGolfclub", changes);
        changes.forEach(change => (change.field === "activeGolfclub") &&  handlePlayerGolfclubChange(userId, change.value))
    }
    const golfClubId = getGolfclubIdFromTokenId(activeGolfClubTokenId, golfclubs);
    console.log("golfClubId",golfClubId);

    if(typeof golfClubId === "number" && !isNaN(golfClubId)){
        lobbyRoom.send(MESSAGE.ACTIVE_GOLFCLUB, golfClubId)
    }

    console.log("  lobbyRoom.state.players.toJSON()",  lobbyRoom.state.players.toJSON());
    lobbyRoom.state.players.forEach((player, key)=>{
        try{
            if(player.realm !== realm) return;
            handleNewPlayer(player.address, player.activeGolfclub, player.tier, player.displayName);
            player.onChange = (changes) => {
                console.log("player on change activeGolfclub", player.address, player.activeGolfclub, changes[0].value);
                changes.forEach(change => (change.field === "activeGolfclub") &&  handlePlayerGolfclubChange(player.address, change.value))
            }
            console.log("player initialized ", player, key);
        }catch(error){

        }
    })
    lobbyRoom.state.players.onAdd = (player, key)=>{
        try{
            if(player.realm !== realm) return;
            handleNewPlayer(player.address, player.activeGolfclub, player.tier, player.displayName);
            player.onChange = (changes) => {
                console.log("player on change activeGolfclub", player.address, player.activeGolfclub, changes[0].value);
                changes.forEach(change => (change.field === "activeGolfclub") &&  handlePlayerGolfclubChange(player.address, change.value))
            }
            console.log("player added ", player, key);
        }catch(error){

        }
    }
    lobbyRoom.state.players.onRemove = (player, key, ...args)=>{
        try{
            if(player.realm !== realm) return;
            if(attached[player.address]){
                if(attached[player.address].entity){
                    player.onAdd = player.onRemove  = player.onChange = null;
                    engine.removeEntity(attached[player.address].entity);
                    console.log("Deleting player", player.address);
                    delete attached[player.address];
                }
            }
        }catch(error){

        }
    }

    function handleNewPlayer (address, golfclubId, tier?, displayName?){
        const foundPlayer = attached[address];
        if(foundPlayer || !golfclubId) return;
        console.log("handleNewPlayer", address, golfclubId, tier, displayName);

        let entity;
        if(isNFTGolfclub(golfclubId)){
            console.log("adding golfclub for new player", golfclubId)
            entity = new Entity();
            entity.addComponent(getGLTFShape(`models/attached/golfClub${golfclubId}.glb`));
            engine.addEntity(entity);
            entity.addComponent(new AttachToAvatar({avatarId:address, anchorPointId:AttachToAvatarAnchorPointId.Position}));
        }

        attached[address] = {
            address,
            entity,
            golfclubId
        };
    }

    function handlePlayerGolfclubChange(address, golfclubId){
        console.log("handlePlayerGolfclubChange",address,golfclubId)
        const foundPlayer = attached[address];
        console.log("foundPlayer",foundPlayer)
        if(!foundPlayer) {
            console.log("attached",attached);
            return;
        };

        if(!foundPlayer.entity && isNFTGolfclub(golfclubId)){
            console.log("adding entity");
            const entity = new Entity();
            entity.addComponent(new GLTFShape(`models/attached/golfClub${golfclubId}.glb`));
            engine.addEntity(entity);
            entity.addComponent(new AttachToAvatar({avatarId:address, anchorPointId:AttachToAvatarAnchorPointId.Position}));
            foundPlayer.entity = entity;

        }else if(foundPlayer.entity && isNFTGolfclub(golfclubId)){
            if(golfclubId === foundPlayer.golfclubId) return;
            console.log("replace", golfclubId);
            foundPlayer.entity.addComponentOrReplace(new GLTFShape(`models/attached/golfClub${golfclubId}.glb`))

        }else if(foundPlayer.entity && !isNFTGolfclub(golfclubId)){
            console.log("removing entity", golfclubId);
            engine.removeEntity(foundPlayer.entity);
            foundPlayer.entity = null;//TODO maybe instead of undefined, just remove from engine but keep in memory
        }

        foundPlayer.golfclubId = golfclubId;
    }
};

function isNFTGolfclub(golfclubId){
    return !isNaN(golfclubId) && typeof golfclubId === "number" && golfclubId !== 1;//TODO id 0 should be shown, but it's shown when we have free golfclub
}

export function getGolfclubIdFromTokenId(tokenId, golfclubs){
    const id = golfclubs.find(g=>g?.CustomData?.tokenId === tokenId)?.ItemId?.replace("golfclub-","");
    return id !== undefined && id !== null ? Number(id) : undefined;
}

function addAvatarRankLabel({tier, address}){
    if(!seasonTierDefinitions[tier]){
        console.log("MISSING TIER, seasonTierDefinitions[tier]", tier)
        return;
    }
    const labelEntity = new Entity();
    const text = new TextShape();

    text.value = seasonTierDefinitions[tier].name;
    text.color = text.outlineColor = Color3.FromHexString(getTierColor(tier));
    text.fontSize = 1;
    text.outlineWidth = 0;
    text.font = new Font(Fonts.SansSerif_Heavy);

    const labelWrapper = new Entity();
    const labelBack = new Entity();
    const labelPlane = new PlaneShape();
    const material = new Material();
    material.albedoColor = new Color4(0,0,0,0.5);
    labelBack.addComponent(material);
    labelBack.setParent(labelWrapper);
    labelBack.addComponent(labelPlane);
    labelBack.addComponent(new Billboard(false,true,false));
    labelBack.addComponent(new Transform({
        scale:new Vector3(0.5,0.1,0.1),
        position:new Vector3(0,0.6,0.05)
    }))

    labelEntity.setParent(labelWrapper);
    labelEntity.addComponent(text);
    labelEntity.addComponent(new Transform({
        scale: new Vector3(0.5,0.5,0.5),
        position: new Vector3(0,0.6,0)
    }))
    labelEntity.addComponent(new Billboard(false,true,false));
    //labelWrapper.addComponent(new AttachToAvatar({avatarId:address, anchorPointId:AttachToAvatarAnchorPointId.NameTag}));

    engine.addEntity(labelWrapper);
}