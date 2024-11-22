"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FriendActionEvents;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function FriendActionEvents(io, socket) {
    socket.on("send-invite", (from, to) => {
        io.to(to).emit("receive-invite-request", from);
    });
    socket.on("request-join", (from, to) => {
        io.to(to).emit("receive-join-request", from);
    });
}
