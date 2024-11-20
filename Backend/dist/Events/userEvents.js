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
    // Handle user registration
    socket.on('register', (userId) => __awaiter(this, void 0, void 0, function* () {
        try {
            socket.join(userId);
            console.log(`User ${userId} joined room ${userId}`);
            const userFriends = yield prisma.friendship.findMany({
                where: { userId },
                select: { friendId: true },
            });
            const noti = yield prisma.friendRequests.findMany({
                where: { toId: userId },
                select: { from: true,
                    fromUsername: true,
                }
            });
            io.to(userId).emit("load-noti", noti);
            const friendIds = userFriends.map(f => f.friendId);
            const mutualFriends = yield prisma.friendship.findMany({
                where: {
                    userId: { in: friendIds },
                    friendId: userId,
                },
                include: {
                    user: {
                        select: {
                            username: true,
                            id: true, // Select specific fields
                            firstname: true,
                            lastname: false,
                            status: true, // Exclude specific fields
                        },
                    },
                },
            });
            const actualFriends = mutualFriends.map(f => f.user);
            io.to(userId).emit("load-friends", actualFriends);
        }
        catch (error) {
            console.error("Error in register event:", error);
        }
    }));
    // Handle sending friend requests
    socket.on("send-friend-request", (senderId, senderUsername, receiverUsername) => __awaiter(this, void 0, void 0, function* () {
        try {
            const receiver = yield prisma.user.findFirst({
                where: { username: receiverUsername },
                select: { id: true },
            });
            if (!receiver) {
                io.to(senderId).emit("user-not-found");
            }
            else {
                const receiverId = receiver.id;
                const isReceived = yield prisma.friendRequests.create({
                    data: {
                        from: senderId,
                        toId: receiverId,
                        fromUsername: senderUsername,
                    }
                });
                if (!isReceived)
                    io.to(senderId).emit("Server-Error");
                io.to(receiverId).emit("receive-friend-request", {
                    senderId,
                    senderUsername
                });
                console.log(`Friend request sent from ${senderId} to ${receiverId}`);
            }
        }
        catch (error) {
            console.error("Error in send-friend-request event:", error);
        }
    }));
    // Handle accepting friend requests
    socket.on("accept-friend-request", (_a) => __awaiter(this, [_a], void 0, function* ({ userId, friendId }) {
        try {
            console.log(userId, friendId);
            yield prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                yield tx.friendship.createMany({
                    data: [
                        { userId, friendId },
                        { userId: friendId, friendId: userId },
                    ],
                });
                const [friendInfo, userInfo] = yield Promise.all([
                    tx.user.findUnique({
                        where: { id: friendId },
                        select: { id: true, username: true, firstname: true, lastname: true },
                    }),
                    tx.user.findUnique({
                        where: { id: userId },
                        select: { id: true, username: true, firstname: true, lastname: true },
                    }),
                ]);
                // Emit updated friend lists
                io.to(userId).emit("receive-friend", friendInfo);
                io.to(friendId).emit("receive-friend", userInfo);
            }));
        }
        catch (error) {
            console.error("Error in accept-friend-request event:", error);
        }
    }));
}
