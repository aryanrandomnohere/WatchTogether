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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors")); // Correct import
const http_1 = __importDefault(require("http"));
const index_1 = __importDefault(require("./Routes/index"));
const socket_io_1 = require("socket.io");
const videoEvents_1 = __importDefault(require("./Events/videoEvents"));
const chatEvents_1 = __importDefault(require("./Events/chatEvents"));
const userEvents_1 = __importDefault(require("./Events/userEvents"));
const FriendActionsEvent_1 = __importDefault(require("./Events/FriendActionsEvent"));
const p2pEvents_1 = __importDefault(require("./Events/p2pEvents"));
const roomManager_1 = require("./roomManager");
const UserManager_1 = require("./UserManager");
const db_1 = require("./db");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: '*', // Allow requests from any domain
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
    credentials: false, // Set to true only if cookies/auth headers are needed
}));
app.use(express_1.default.json());
app.use('/api/v1', index_1.default);
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*', // Allow WebSocket connections from any domain
        methods: ['GET', 'POST'],
    }
});
io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        socket.join(`${roomId}`);
        if (roomManager_1.roomManager.getInstance().getRoomTotal(roomId) === 0) {
            const roomState = yield db_1.prisma.room.findUnique({
                where: {
                    userId: roomId,
                },
                select: {
                    playingId: true,
                    playingTitle: true,
                    playingType: true,
                    playingAnimeId: true,
                    isPlaying: true,
                    currentTime: true,
                    episode: true,
                    season: true,
                }
            });
            if (!roomState)
                return;
            roomManager_1.roomManager.getInstance().subscribe(roomId, roomState);
        }
        roomManager_1.roomManager.getInstance().addSubscriber(roomId, userId, socket.id);
        const roomInstance = (_a = roomManager_1.roomManager.getInstance()) === null || _a === void 0 ? void 0 : _a.getRoom(roomId);
        if (!roomInstance || roomInstance.subscribers.size === 0)
            return;
        let allUserData = [];
        for (const [key, values] of roomInstance.subscribers) {
            const userInstance = UserManager_1.UserManager.getInstance();
            const user = userInstance.getUser(key);
            if (!user)
                continue;
            allUserData.push(user);
        }
        io.to(`${roomId}`).emit("room-people-data", roomManager_1.roomManager.getInstance().getRoomTotal(roomId), allUserData);
    }));
    socket.on("leave-room", (roomId) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        console.log("Component unmounted leave-room called");
        roomManager_1.roomManager.getInstance().removeSubscriber(roomId, socket.id);
        if (roomManager_1.roomManager.getInstance().getRoomTotal(roomId) === 0) {
            const lastRoomState = roomManager_1.roomManager.getInstance().unsubscribe(roomId);
            if (!lastRoomState)
                return;
            yield db_1.prisma.room.update({
                where: {
                    userId: roomId,
                },
                data: lastRoomState
            });
            return;
        }
        const roomInstance = (_a = roomManager_1.roomManager.getInstance()) === null || _a === void 0 ? void 0 : _a.getRoom(roomId);
        if (!roomInstance || roomInstance.subscribers.size === 0)
            return;
        let allUserData = [];
        for (const [key, values] of roomInstance.subscribers) {
            const userInstance = UserManager_1.UserManager.getInstance();
            const user = userInstance.getUser(key);
            if (!user)
                continue;
            allUserData.push(user);
        }
        io.to(`${roomId}`).emit("room-people-data", roomManager_1.roomManager.getInstance().getRoomTotal(roomId), allUserData);
        return;
    }));
    (0, userEvents_1.default)(io, socket);
    (0, videoEvents_1.default)(io, socket);
    (0, chatEvents_1.default)(io, socket);
    (0, FriendActionsEvent_1.default)(io, socket);
    (0, p2pEvents_1.default)(io, socket);
    // Handle disconnection
    socket.on("disconnect", () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        // Remove the user from userManager
        const userId = UserManager_1.UserManager.getInstance().removeUser(socket.id);
        if (userId) {
            yield db_1.prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    status: "OFFLINE"
                }
            });
            // Fetch the user's friends
            const userFriends = yield db_1.prisma.friendship.findMany({
                where: { userId },
                select: { friendId: true },
            });
            const friendIds = userFriends.map((f) => f.friendId);
            friendIds.forEach((friendId) => {
                io.to(friendId).emit("friend-status-update", {
                    userId,
                    newStatus: "OFFLINE",
                });
            });
        }
        const roomId = roomManager_1.roomManager.getInstance().userDisconnected(socket.id);
        if (!roomId)
            return;
        const roomInstance = (_a = roomManager_1.roomManager.getInstance()) === null || _a === void 0 ? void 0 : _a.getRoom(roomId);
        if (!roomInstance)
            return;
        if (roomManager_1.roomManager.getInstance().getRoomTotal(roomId) === 0) {
            const lastRoomState = roomManager_1.roomManager.getInstance().unsubscribe(roomId);
            if (!lastRoomState)
                return;
            yield db_1.prisma.room.update({
                where: {
                    userId: roomId,
                },
                data: lastRoomState
            });
            return;
        }
        let allUserData = [];
        for (const [key, values] of roomInstance.subscribers) {
            const userInstance = UserManager_1.UserManager.getInstance();
            const user = userInstance.getUser(key);
            if (!user)
                continue;
            allUserData.push(user);
        }
        io.to(`${roomId}`).emit("room-people-data", roomManager_1.roomManager.getInstance().getRoomTotal(roomId), allUserData);
    }));
});
server.listen(3000, '0.0.0.0', () => {
    console.log('Backend running on http://0.0.0.0:3000');
});
