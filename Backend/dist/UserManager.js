"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = void 0;
class UserManager {
    constructor() {
        this.users = new Map();
    }
    static getInstance() {
        if (!this.instance) {
            return this.instance = new UserManager;
        }
        return this.instance;
    }
    addUser(socketId, userInfo) {
        this.users.set(socketId, userInfo);
    }
    removeUser(socketId) {
        this.users.delete(socketId);
    }
    getUser(id) {
        return this.users.get(id);
    }
}
exports.UserManager = UserManager;
