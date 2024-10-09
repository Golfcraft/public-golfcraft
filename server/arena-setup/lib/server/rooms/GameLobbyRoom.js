"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameLobbyRoom = exports.lobbyRooms = void 0;
const colyseus_1 = require("colyseus");
const schema_1 = require("@colyseus/schema");
class State extends schema_1.Schema {
}
exports.lobbyRooms = {};
class GameLobbyRoom extends colyseus_1.Room {
    constructor() {
        super(...arguments);
        this.clientsMapBySessionId = {};
    }
    onCreate({ realm, user }) {
        this.realm = realm;
        exports.lobbyRooms[realm] = this;
        console.log("onCreate lobby", realm, user);
    }
    onJoin(client, { realm, user }) {
        console.log("onJoin lobby", realm, user);
        this.clientsMapBySessionId[client.sessionId] = client;
    }
    onLeave(client, consented) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("onLeave lobby", consented);
            try {
                if (consented) {
                    throw new Error('consented leave');
                }
                yield this.allowReconnection(client, 30);
            }
            catch (error) {
                delete this.clientsMapBySessionId[client.sessionId];
            }
        });
    }
    onDispose() {
        console.log("onDispose");
        delete exports.lobbyRooms[this.realm];
    }
}
exports.GameLobbyRoom = GameLobbyRoom;
