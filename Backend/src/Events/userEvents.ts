import { PrismaClient } from "@prisma/client";
import { Server, Socket } from "socket.io";

const prisma = new PrismaClient();

export default function userEvents(io:Server, socket:Socket){
    socket.on('register', async (userId: string) => {
        socket.join(userId);
        console.log(`User ${userId} joined room ${userId}`);

        const userfriends = await prisma.friendship.findMany(
            {
              where:{userId},
              select:{friendId:true}
            }
                    ) 
                    const friendIds = userfriends.map(f=>f.friendId)
                    
                    const mutualFriends = await prisma.friendship.findMany({
                        where:{userId:{in: friendIds},
                             friendId:userId},
                        include:{user:true}
                    })
          const actualFriends = mutualFriends.map(f=>f.user)
                io.to(userId).emit("load-friends", actualFriends )
        });  

       


    socket.emit("send-friend-request", async(senderId:string,Senderusername:string, receiverId:string)=>{
               io.to(receiverId).emit("receive-friend-request",{
                senderId,
                message:`${senderId} sent you a friend request`
               })
               console.log(`Friend request sent from ${senderId} to ${receiverId}`);
})

socket.on("accept-friend-request", async (userId: string, friendId: string) => {
    const newFriend = await prisma.friendship.createMany({
        data: [
            { userId: userId, friendId: friendId },
            { userId: friendId, friendId: userId },
        ],
    });

    const friendInfo = await prisma.user.findUnique({
        where: { id: friendId },
        select: { id: true, username: true, firstname:true, lastname:true },
    });

    const userInfo = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, firstname:true, lastname:true },
    });

    // Emit the updated friends list to both users
    io.to(userId).emit("receive-friend", friendInfo);
    io.to(friendId).emit("receive-friend", userInfo);
});


}