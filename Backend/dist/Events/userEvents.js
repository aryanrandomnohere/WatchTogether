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
exports.default = userEvents;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function userEvents(io, socket) {
    socket.on('register', (userId) => __awaiter(this, void 0, void 0, function* () {
        socket.join(userId);
        console.log(`User ${userId} joined room ${userId}`);
        const userfriends = yield prisma.friendship.findMany({
            where: { userId },
            select: { friendId: true }
        });
        const friendIds = userfriends.map(f => f.friendId);
        const mutualFriends = yield prisma.friendship.findMany({
            where: { userId: { in: friendIds },
                friendId: userId },
            include: { user: true }
        });
        const actualFriends = mutualFriends.map(f => f.user);
        io.to(userId).emit("load-friends", actualFriends);
    }));
    socket.emit("send-friend-request", (senderId, Senderusername, receiverId) => __awaiter(this, void 0, void 0, function* () {
        io.to(receiverId).emit("receive-friend-request", {
            senderId,
            message: `${senderId} sent you a friend request`
        });
        console.log(`Friend request sent from ${senderId} to ${receiverId}`);
    }));
    socket.on("accept-friend-request", (userId, friendId) => __awaiter(this, void 0, void 0, function* () {
        const newFriend = yield prisma.friendship.createMany({
            data: [
                { userId: userId, friendId: friendId },
                { userId: friendId, friendId: userId },
            ],
        });
        const friendInfo = yield prisma.user.findUnique({
            where: { id: friendId },
            select: { id: true, username: true, firstname: true, lastname: true },
        });
        const userInfo = yield prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, username: true, firstname: true, lastname: true },
        });
        // Emit the updated friends list to both users
        io.to(userId).emit("receive-friend", friendInfo);
        io.to(friendId).emit("receive-friend", userInfo);
    }));
}
