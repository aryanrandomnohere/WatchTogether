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
                inCall: {
                    people: new Set(),
                    firstOffer: null,
                }
            });
        }
    }
    unsubscribe(roomId) {
        var _a;
        const lastRoomState = (_a = this.rooms.get(roomId)) === null || _a === void 0 ? void 0 : _a.roomStatus;
        this.rooms.delete(roomId);
        return lastRoomState;
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
            return roomId;
        }
    }
    joinCall(roomId, userId, sdp) {
        var _a, _b;
        const room = this.rooms.get(roomId);
        if (!room)
            return false;
        console.log(room.inCall, "room.inCall");
        if (((_a = room.inCall) === null || _a === void 0 ? void 0 : _a.people.size) === 0) {
            room.inCall.people.add(userId);
            room.inCall.firstOffer = sdp;
            return true;
        }
        (_b = room.inCall) === null || _b === void 0 ? void 0 : _b.people.add(userId);
        return true;
    }
    leaveCall(roomId, userId) {
        const room = this.rooms.get(roomId);
        if (!room || !room.inCall)
            return false;
        room.inCall.people.delete(userId);
    }
    callSize(roomId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        const peopleSize = room.inCall.people.size;
        return peopleSize;
    }
    getCallMemberSize(roomId) {
        var _a, _b;
        const CallSize = (_b = (_a = this.rooms.get(roomId)) === null || _a === void 0 ? void 0 : _a.inCall) === null || _b === void 0 ? void 0 : _b.people.size;
        return CallSize;
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
