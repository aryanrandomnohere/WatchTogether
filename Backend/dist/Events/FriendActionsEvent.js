"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FriendActionEvents;
function FriendActionEvents(io, socket) {
    socket.on("send-invite", (from, fromUsername, to) => {
        io.to(to).emit("receive-invite-request", fromUsername, from);
    });
    socket.on("request-join", (from, fromUsername, to) => {
        io.to(to).emit("receive-join-request", fromUsername, from);
    });
}
