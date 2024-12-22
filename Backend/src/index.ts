import express, {Request, Response} from 'express';
import cors from 'cors';
import http from "http";
import mainRouter from './Routes/index';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import videoEvents from './Events/videoEvents';
import chatEvents from './Events/chatEvents';
import userEvents from './Events/userEvents';
import FriendActionEvents from './Events/FriendActionsEvent';
const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json())

app.use('/api/v1',mainRouter);

const server = http.createServer(app);
const rooms: Record<string, Set<string>> = {};
const io = new Server(server, {
  cors: {
      origin: "*",  // replace with clientâ€™s origin if different
      methods: ["GET", "POST"]
  }
});


io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

  socket.on("join-room", async (userId) => {
      socket.join(userId);

      // Add the user to the room
      if (!rooms[userId]) {
          rooms[userId] = new Set();
      }
      rooms[userId].add(socket.id);

      // Emit the user count for the room
      io.to(userId).emit("room-user-count", rooms[userId].size);

      try {
          const oldMessages = await prisma.chat.findMany({
              where: { userId },
              orderBy: { createdAt: "desc" },
              take: 10,
              select: { name: true, time: true, message: true }
          });

          const playing = await prisma.room.findFirst({
              where:{
                  userId
              },
              select:{
                  playingId:true,
                  playingTitle:true,
                  playingType:true,
                  playingAnimeId:true
              }
          })

         

          socket.emit("load-messages", oldMessages.reverse());
          socket.emit("load-playing", playing);
      } catch (error) {
          console.error("Error fetching messages:", error);
          socket.emit("error-loading-messages", "Failed to load previous messages.");
      }
  });
 
  userEvents(io,socket);
  videoEvents(io,socket);
  chatEvents(io,socket);
  FriendActionEvents(io,socket);
  // Handle disconnection
  socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);

      // Remove the user from any room they were in
      for (const roomId in rooms) {
          rooms[roomId].delete(socket.id);
          if (rooms[roomId].size === 0) {
              delete rooms[roomId];  // Clean up empty rooms
          } else {
              io.to(roomId).emit("room-user-count", rooms[roomId].size);
          }
      }
  });
});

server.listen(5000, '0.0.0.0', () => {
    console.log('Backend running on http://0.0.0.0:5000');
  });