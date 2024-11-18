import { PrismaClient } from "@prisma/client";
import { Server, Socket } from "socket.io";

const prisma = new PrismaClient();

export default function userEvents(io: Server, socket: Socket) {
    // Handle user registration
    socket.on('register', async (userId: string) => {
        try {
            socket.join(userId);
            console.log(`User ${userId} joined room ${userId}`);

            const userFriends = await prisma.friendship.findMany({
                where: { userId },
                select: { friendId: true },
            });

            const friendIds = userFriends.map(f => f.friendId);

            const mutualFriends = await prisma.friendship.findMany({
                where: {
                    userId: { in: friendIds },
                    friendId: userId,
                },
                include: { user: true },
            });

            const actualFriends = mutualFriends.map(f => f.user);
            io.to(userId).emit("load-friends", actualFriends);
        } catch (error) {
            console.error("Error in register event:", error);
        }
    });

    // Handle sending friend requests
    socket.on("send-friend-request", async (senderId: string, senderUsername: string, receiverUsername: string) => {
        try {
            const receiver = await prisma.user.findFirst({
                where: { username: receiverUsername },
                select: { id: true },
            });

            if (!receiver) {
                io.to(senderId).emit("user-not-found");
            } else {
                const receiverId = receiver.id;
                  const isReceived =   await prisma.friendRequests.create({
                        data:{
                            from:senderId,
                            toId:receiverId,
                            fromUsername:senderUsername,
                        }
                    })
                    if(!isReceived) io.to(senderId).emit("user-not-found")
                io.to(receiverId).emit("receive-friend-request", {
                    senderId,
                    senderUsername
                });

                console.log(`Friend request sent from ${senderId} to ${receiverId}`);
            }
        } catch (error) {
            console.error("Error in send-friend-request event:", error);
        }
    });

    // Handle accepting friend requests
    socket.on("accept-friend-request", async (userId: string, friendId: string) => {
        try {
            await prisma.$transaction(async (tx) => {
                await tx.friendship.createMany({
                    data: [
                        { userId, friendId },
                        { userId: friendId, friendId: userId },
                    ],
                });

                const [friendInfo, userInfo] = await Promise.all([
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
            });
        } catch (error) {
            console.error("Error in accept-friend-request event:", error);
        }
    });
}
