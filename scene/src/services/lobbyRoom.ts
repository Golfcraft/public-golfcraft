let lobbyRoom = null;
//TODO create on file apart an abstraction ReconnectableRoom / createReconnectableRoom that handles listeners per room.id
const listeners = {
    onMessage:[]
};

const reconnectListeners = () => {
    listeners.onMessage.forEach(({type, fn})=>{
        lobbyRoom.onMessage(type, fn);
    });
};
const onMessage = (type, fn) => {
    listeners.onMessage.push({type, fn});
    lobbyRoom.onMessage(type, fn);
};

const reconnectableRoom = {
    onMessage,
    reconnectListeners,
    sessionId:undefined
};

const setLobbyRoom = (newLobbyRoom) => {
    lobbyRoom = newLobbyRoom;
    reconnectableRoom.sessionId = newLobbyRoom.sessionId;
    return reconnectableRoom;
};

const getLobbyRoom = () => {
    return reconnectableRoom;
};

export {
    setLobbyRoom,
    getLobbyRoom
};