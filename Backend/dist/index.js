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
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const index_1 = __importDefault(require("./Routes/index"));
const socket_io_1 = require("socket.io");
const client_1 = require("@prisma/client");
const videoEvents_1 = __importDefault(require("./Events/videoEvents"));
const chatEvents_1 = __importDefault(require("./Events/chatEvents"));
const userEvents_1 = __importDefault(require("./Events/userEvents"));
const FriendActionsEvent_1 = __importDefault(require("./Events/FriendActionsEvent"));
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/v1', index_1.default);
const server = http_1.default.createServer(app);
const rooms = {};
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*", // replace with clientâ€™s origin if different
        methods: ["GET", "POST"]
    }
});
io.on("connection", (socket) => {
    socket.on("join-room", (roomId) => __awaiter(void 0, void 0, void 0, function* () {
        socket.join(roomId);
        // Add the user to the room
        if (!rooms[roomId]) {
            rooms[roomId] = new Set();
        }
        rooms[roomId].add(socket.id);
        // Emit the user count for the room
        io.to(roomId).emit("room-user-count", rooms[roomId].size);
    }));
    (0, userEvents_1.default)(io, socket);
    (0, videoEvents_1.default)(io, socket);
    (0, chatEvents_1.default)(io, socket);
    (0, FriendActionsEvent_1.default)(io, socket);
    // Handle disconnection
    socket.on("disconnect", () => {
        // Remove the user from any room they were in
        for (const roomId in rooms) {
            rooms[roomId].delete(socket.id);
            if (rooms[roomId].size === 0) {
                delete rooms[roomId]; // Clean up empty rooms
            }
            else {
                io.to(roomId).emit("room-user-count", rooms[roomId].size);
            }
        }
    });
});
server.listen(5000, '0.0.0.0', () => {
    console.log('Backend running on http://0.0.0.0:5000');
});
