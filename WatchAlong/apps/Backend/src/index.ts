import express, { Request, Response } from 'express';
import cors from 'cors'; // Correct import
import http from "http";
import mainRouter from './Routes/index';
import { Server } from 'socket.io';
import videoEvents from './Events/videoEvents';
import chatEvents from './Events/chatEvents';
import userEvents from './Events/userEvents';
import FriendActionEvents from './Events/FriendActionsEvent';
import p2pEvents from './Events/p2pEvents';
import { roomManager } from './roomManager';
import { UserManager } from './UserManager';
import { prisma } from "./db";
import { log } from 'console';
const app = express();

app.use(cors({
  origin: '*',                         // Allow requests from any domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
  credentials: false,                  // Set to true only if cookies/auth headers are needed
}));
interface peopleType {
  displayname: string;
  username:string;
  id:string;
  avatar:string;
}
app.use(express.json());

app.use('/api/v1', mainRouter);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',                       // Allow WebSocket connections from any domain
    methods: ['GET', 'POST'],
  }
});

io.on("connection", (socket) => {
  socket.on("join-room", async (roomId:string, userId:string) => {
    socket.join(`${roomId}`);
   if(roomManager.getInstance().getRoomTotal(roomId) === 0){
    const roomState = await prisma.room.findUnique({
      where:{
        userId:roomId,
      },
      select:{
        playingId:true,
        playingTitle:true,  
        playingType:true,
        playingAnimeId:true,  
        isPlaying:true,
        currentTime:true,   
        episode:true,    
        season:true,
      }
    })
    if(!roomState) return
    roomManager.getInstance().subscribe(roomId,roomState)
   }
     roomManager.getInstance().addSubscriber(roomId,userId,socket.id)
     const roomInstance = roomManager.getInstance()?.getRoom(roomId);
     if (!roomInstance || roomInstance.subscribers.size === 0) return;
     let allUserData: peopleType[] = []; 
     
     for (const [key, values] of roomInstance.subscribers) {
      const userInstance = UserManager.getInstance();
      const user = userInstance.getUser(key)
      if(!user) continue
       allUserData.push(user);
     }
     io.to(`${roomId}`).emit("room-people-data", roomManager.getInstance().getRoomTotal(roomId),allUserData);
  });
  socket.on("leave-room",async (roomId:string)=>{
    console.log("Component unmounted leave-room called")
  roomManager.getInstance().removeSubscriber(roomId,socket.id);
  if(roomManager.getInstance().getRoomTotal(roomId) === 0) {
    const lastRoomState = roomManager.getInstance().unsubscribe(roomId)
    if(!lastRoomState) return
    await prisma.room.update({
      where:{
      userId:roomId,
      },
      data:lastRoomState 
    })
    return
     }
  const roomInstance = roomManager.getInstance()?.getRoom(roomId);
  if (!roomInstance || roomInstance.subscribers.size === 0) return;
  let allUserData: peopleType[] = []; 
  
  for (const [key, values] of roomInstance.subscribers) {
   const userInstance = UserManager.getInstance();
   const user = userInstance.getUser(key)
   if(!user) continue
    allUserData.push(user);
  }
  io.to(`${roomId}`).emit("room-people-data", roomManager.getInstance().getRoomTotal(roomId),allUserData);
  return  
  });
  userEvents(io, socket);
  videoEvents(io, socket);
  chatEvents(io, socket);
  FriendActionEvents(io, socket); 
  p2pEvents(io,socket)
  // Handle disconnection
socket.on("disconnect",async () => {
    // Remove the user from userManager
    const userId = UserManager.getInstance().removeUser(socket.id)
    if(userId){
        await prisma.user.update({
        where:{
            id:userId
        },
        data:{
            status:"OFFLINE"
        }
      })
      // Fetch the user's friends
      const userFriends = await prisma.friendship.findMany({
        where: { userId },
        select: { friendId: true },
      });
  
      const friendIds = userFriends.map((f) => f.friendId);
      friendIds.forEach((friendId) => {
        io.to(friendId).emit("friend-status-update", {
          userId,
          newStatus:"OFFLINE", 
        });
      });
    }
    const roomId = roomManager.getInstance().userDisconnected(socket.id)
    if(!roomId) return
    const roomInstance = roomManager.getInstance()?.getRoom(roomId);
    if (!roomInstance) return;
    if(roomManager.getInstance().getRoomTotal(roomId) === 0) {
    const lastRoomState = roomManager.getInstance().unsubscribe(roomId)
    if(!lastRoomState) return
    await prisma.room.update({
      where:{
      userId:roomId,
      },
      data:lastRoomState 
    })
    return
     }
     let allUserData: peopleType[] = []; 
     
     for (const [key, values] of roomInstance.subscribers) {
      const userInstance = UserManager.getInstance();
      const user = userInstance.getUser(key)
      if(!user) continue
       allUserData.push(user);
     }
     io.to(`${roomId}`).emit("room-people-data", roomManager.getInstance().getRoomTotal(roomId),allUserData);
});
});

server.listen(3000, '0.0.0.0', () => {
console.log('Backend running on http://0.0.0.0:3000');
});
 