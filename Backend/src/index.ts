import express, { Request, Response } from 'express';
import cors from 'cors'; // Correct import
import http from "http";
import mainRouter from './Routes/index';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import videoEvents from './Events/videoEvents';
import chatEvents from './Events/chatEvents';
import userEvents from './Events/userEvents';
import FriendActionEvents from './Events/FriendActionsEvent';
import p2pEvents from './Events/p2pEvents';
import { roomManager } from './roomManager';
import { UserManager } from './UserManager';
import {  log, trace } from 'console';

const app = express();
const prisma = new PrismaClient();
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
    socket.join(`${roomId}'s room`);
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
      log(user)
      if(!user) continue
       allUserData.push(user);
     }
     log(allUserData)
     io.to(`${roomId}'s room`).emit("room-people-data", roomManager.getInstance().getRoomTotal(roomId),allUserData);
  });
  userEvents(io, socket);
  videoEvents(io, socket);
  chatEvents(io, socket);
  FriendActionEvents(io, socket); 
  p2pEvents(io,socket)
  // Handle disconnection
socket.on("disconnect",async () => {
    // Remove the user from any room they were in
    UserManager.getInstance().removeUser(socket.id)
    roomManager.getInstance().userDisconnected(socket.id)
    for (const roomId in roomManager.getInstance()) {
      if(roomManager.getInstance().getRoom(roomId)){
      roomManager.getInstance().removeSubscriber(roomId, socket.id)
      if(roomManager.getInstance().getRoomTotal(roomId) === 0) roomManager.getInstance().unsubscribe(roomId)
        return 
      } }
  });
});

server.listen(3000, '0.0.0.0', () => {
console.log('Backend running on http://0.0.0.0:3000');
});
  