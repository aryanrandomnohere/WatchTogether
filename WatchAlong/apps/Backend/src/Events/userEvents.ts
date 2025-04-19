import { Server, Socket } from "socket.io";
import { UserManager } from "../UserManager";
import { prisma } from "../db";;

export default function userEvents(io: Server, socket: Socket) {
    // Handle user registration
    socket.on('register', async (userId: string) => {
        try {
            socket.join(userId);
            const userInfo = await prisma.user.findUnique({
                where:{
                id:userId
                      },
                select:{
                displayname:true,
                username:true,
                avatar:true,
                id:true,
                }
            })
            if(userInfo){
            UserManager.getInstance().addUser(socket.id,userInfo)
        }else{
            console.error("User does not exists")
        }
            const noti = await prisma.friendRequests.findMany({
                where:{toId:userId},
                select:{from:true,
                    fromUsername:true,
                }
            })

            const response = await prisma.user.update({
                where:{
                    id:userId
                },
                data:{
                    status:"ONLINE"
                }
              })
              // Fetch the user's friends
              const userFriends = await prisma.friendship.findMany({
                where: { userId },
                select: { friendId: true },
              });
          
              const friendIds = userFriends.map((f) => f.friendId);
          
              // Notify all friends by broadcasting to their rooms
              friendIds.forEach((friendId) => {
                io.to(friendId).emit("friend-status-update", {
                  userId,
                  newStatus:"ONLINE", 
                });
              });
           
            io.to(userId).emit("load-noti", noti)

          


        } catch (error) {
            console.error("Error in register event:", error);
        }
    });
    //End

    //Handle Update Friend Status 
    socket.on("update-status", async (userId: string, newStatus: string) => {
        try {
          //Updating status in db
          await prisma.user.update({
            where:{
                id:userId
            },
            data:{
                status:newStatus
            }
          })
          // Fetch the user's friends
          const userFriends = await prisma.friendship.findMany({
            where: { userId },
            select: { friendId: true },
          });
      
          const friendIds = userFriends.map((f) => f.friendId);
      
          // Notify all friends by broadcasting to their rooms
          friendIds.forEach((friendId) => {
            io.to(friendId).emit("friend-status-update", {
              userId,
              newStatus, // e.g., 'online', 'offline', etc.
            });
          });
        } catch (error) {
          console.error("1");
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
                    if(!isReceived) io.to(senderId).emit("Server-Error")
                io.to(receiverId).emit("receive-friend-request", {
                    senderId,
                    senderUsername
                });

            }
        } catch (error) {
            console.error("Error in send-friend-request event:", error);
        }
    });

    // Handle accepting friend requests
    socket.on("accept-friend-request", async ({userId, friendId}:{userId:string, friendId:string}) => {
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
                        select: { id: true, username: true, displayname:true,status:true },
                    }),
                    tx.user.findUnique({
                        where: { id: userId },
                        select: { id: true, username: true,displayname:true,status:true  },
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