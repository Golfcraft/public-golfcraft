const state = {
    lobby:null
};

export const registerLobby = (lobbyRoom)=>{
    state.lobby = lobbyRoom;
}

export const lobbyResetRoom = (roomIndex)=>{
    state.lobby.resetRoom(roomIndex);
}
