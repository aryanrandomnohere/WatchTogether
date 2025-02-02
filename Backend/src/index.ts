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
import { log } from 'console';
import p2pEvents from './Events/p2pEvents';
interface peopleType {
  displayname: string;
  username:string;
  userId:string;
  avatar:string;
}
const app = express();
const prisma = new PrismaClient();
app.use(cors({
  origin: '*',                         // Allow requests from any domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
  credentials: false,                  // Set to true only if cookies/auth headers are needed
}));

app.use(express.json());

app.use('/api/v1', mainRouter);

const server = http.createServer(app);
export const rooms: Record<string, Map<string,peopleType>> = {};
const io = new Server(server, {
  cors: {
    origin: '*',                       // Allow WebSocket connections from any domain
    methods: ['GET', 'POST'],
  }
});

io.on("connection", (socket) => {
  socket.on("join-room", async (roomId:string, userInfo:peopleType) => {
    socket.join(`${roomId}'s room`);
log(userInfo)
    // Add the user to the room
    if (!rooms[roomId]) {
      rooms[roomId] = new Map();
    }
    rooms[roomId].set(socket.id,userInfo);
    // Creates an array of users in a room
    const allUsers = Array.from(rooms[roomId].values())
    // Emit the user count for the room
    log(allUsers)
    io.to(`${roomId}'s room`).emit("room-people-data", rooms[roomId].size,allUsers);
  });
  userEvents(io, socket);
  videoEvents(io, socket);
  chatEvents(io, socket);
  FriendActionEvents(io, socket);
  p2pEvents(io,socket)
  // Handle disconnection
  socket.on("disconnect", () => {
    // Remove the user from any room they were in
    for (const roomId in rooms) {
      rooms[roomId].delete(socket.id);
      if (rooms[roomId].size === 0) {
        delete rooms[roomId]; // Clean up empty rooms
      } else {
        const allUsers = Array.from(rooms[roomId].values())
        io.to(roomId).emit("room-people-data", rooms[roomId].size,allUsers);
      }
    }
  });
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Backend running on http://0.0.0.0:3000');
});
