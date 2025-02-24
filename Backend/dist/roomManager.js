"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomManager = void 0;
class roomManager {
    constructor() {
        this.rooms = new Map();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new roomManager;
            return this.instance;
        }
        return this.instance;
    }
    subscribe(roomId, roomStatus) {
        if (!this.rooms.get(roomId)) {
            this.rooms.set(roomId, {
                roomStatus,
                subscribers: new Map(),
            });
        }
    }
    unsubscribe(roomId) {
        this.rooms.delete(roomId);
        return;
    }
    addSubscriber(roomId, userId, socketId) {
        var _a;
        if (!this.rooms.get(roomId)) {
            console.error("Room does not exists");
            return;
        }
        (_a = this.rooms.get(roomId)) === null || _a === void 0 ? void 0 : _a.subscribers.set(socketId, userId);
    }
    removeSubscriber(roomId, socketId) {
        const room = this.rooms.get(roomId);
        if (!room || !room.subscribers)
            return;
        room.subscribers.delete(socketId);
    }
    userDisconnected(socketId) {
        for (const [roomId, room] of this.rooms.entries()) {
            if (!room || !room.subscribers)
                continue;
            room.subscribers.delete(socketId);
        }
    }
    getRoom(id) {
        return this.rooms.get(id) || null;
    }
    getRoomTotal(id) {
        var _a;
        if (!this.rooms.get(id))
            return 0;
        return (_a = this.rooms.get(id)) === null || _a === void 0 ? void 0 : _a.subscribers.size;
    }
}
exports.roomManager = roomManager;
