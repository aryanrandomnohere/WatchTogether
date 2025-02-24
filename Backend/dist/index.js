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
const client_1 = require("@prisma/client");
const videoEvents_1 = __importDefault(require("./Events/videoEvents"));
const chatEvents_1 = __importDefault(require("./Events/chatEvents"));
const userEvents_1 = __importDefault(require("./Events/userEvents"));
const FriendActionsEvent_1 = __importDefault(require("./Events/FriendActionsEvent"));
const p2pEvents_1 = __importDefault(require("./Events/p2pEvents"));
const roomManager_1 = require("./roomManager");
const UserManager_1 = require("./UserManager");
const console_1 = require("console");
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
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
        socket.join(`${roomId}'s room`);
        if (roomManager_1.roomManager.getInstance().getRoomTotal(roomId) === 0) {
            const roomState = yield prisma.room.findUnique({
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
        const allUsersId = Array.from(roomInstance.subscribers.values());
        let allUserData = [];
        for (const [key, values] of roomInstance.subscribers) {
            const userInstance = UserManager_1.UserManager.getInstance();
            const user = userInstance.getUser(key);
            (0, console_1.log)(user);
            if (!user)
                continue;
            allUserData.push(user);
        }
        (0, console_1.log)(allUserData);
        io.to(`${roomId}'s room`).emit("room-people-data", roomManager_1.roomManager.getInstance().getRoomTotal(roomId), allUserData);
    }));
    (0, userEvents_1.default)(io, socket);
    (0, videoEvents_1.default)(io, socket);
    (0, chatEvents_1.default)(io, socket);
    (0, FriendActionsEvent_1.default)(io, socket);
    (0, p2pEvents_1.default)(io, socket);
    // Handle disconnection
    socket.on("disconnect", () => __awaiter(void 0, void 0, void 0, function* () {
        // Remove the user from any room they were in
        UserManager_1.UserManager.getInstance().removeUser(socket.id);
        for (const roomId in roomManager_1.roomManager.getInstance()) {
            if (roomManager_1.roomManager.getInstance().getRoom(roomId)) {
                roomManager_1.roomManager.getInstance().removeSubscriber(roomId, socket.id);
                if (roomManager_1.roomManager.getInstance().getRoomTotal(roomId) === 0)
                    roomManager_1.roomManager.getInstance().unsubscribe(roomId);
                return;
            }
        }
    }));
});
server.listen(3000, '0.0.0.0', () => {
    console.log('Backend running on http://0.0.0.0:3000');
});
