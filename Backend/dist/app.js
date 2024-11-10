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
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const port = 8000;
app.use((0, cors_1.default)());
// Create an HTTP server
const server = http_1.default.createServer(app);
// Track users in each room
const rooms = {};
// Initialize Socket.io with the HTTP server
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:5173", // replace with client’s origin if different
        methods: ["GET", "POST"]
    }
});
// Listen for incoming connections from clients
io.on("connection", (socket) => {
    console.log(`A user connected: ${socket.id}`);
    socket.on("join-room", (userId) => __awaiter(void 0, void 0, void 0, function* () {
        socket.join(userId);
        // Add the user to the room
        if (!rooms[userId]) {
            rooms[userId] = new Set();
        }
        rooms[userId].add(socket.id);
        // Emit the user count for the room
        io.to(userId).emit("room-user-count", rooms[userId].size);
        try {
            const oldMessages = yield prisma.chat.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: 10,
                select: { name: true, time: true, message: true }
            });
            const playing = yield prisma.room.findFirst({
                where: {
                    userId
                },
                select: {
                    playing: true
                }
            });
            socket.emit("load-messages", oldMessages.reverse());
            socket.emit("load-playing", playing);
        }
        catch (error) {
            console.error("Error fetching messages:", error);
            socket.emit("error-loading-messages", "Failed to load previous messages.");
        }
    }));
    socket.on("change-video", (_a) => __awaiter(void 0, [_a], void 0, function* ({ url, roomId }) {
        console.log(url);
        try {
            const playing = yield prisma.room.update({
                where: { userId: roomId },
                data: { playing: url },
                select: { playing: true }
            });
            console.log(playing);
            io.to(roomId).emit("receive-playing", playing);
        }
        catch (error) {
            console.error("Error saving video:", error);
        }
    }));
    socket.on("send-message", (_a) => __awaiter(void 0, [_a], void 0, function* ({ name, time, message, userId }) {
        try {
            const newMessage = yield prisma.chat.create({
                data: { name, message, time, userId },
            });
            io.to(userId).emit("receive-message", newMessage);
        }
        catch (error) {
            console.error("Error saving message:", error);
            socket.emit("error-saving-message", "Failed to save message.");
        }
    }));
    // Handle disconnection
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
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
// Start the server
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
