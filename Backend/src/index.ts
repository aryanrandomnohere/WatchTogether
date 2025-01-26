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

const app = express();
const prisma = new PrismaClient();

// Remove this line: const cors = require('cors'); (it's not needed)

app.use(cors({
  origin: 'https://d2mpu663tz24o9.cloudfront.net', // Allow this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],    // Allow specific HTTP methods
  credentials: true,                            // If sending cookies or authentication headers
}));

app.use(express.json());

app.use('/api/v1', mainRouter);

const server = http.createServer(app);
const rooms: Record<string, Set<string>> = {};
const io = new Server(server, {
  cors: {
      origin: "*",  // replace with client’s origin if different
      methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {

  socket.on("join-room", async (roomId) => {
      socket.join(roomId);

      // Add the user to the room
      if (!rooms[roomId]) {
          rooms[roomId] = new Set();
      }
      rooms[roomId].add(socket.id);
     
      // Emit the user count for the room
      io.to(roomId).emit("room-user-count", rooms[roomId].size);
  });

  userEvents(io, socket);
  videoEvents(io, socket);
  chatEvents(io, socket);
  FriendActionEvents(io, socket);

  // Handle disconnection
  socket.on("disconnect", () => {

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

server.listen(3000, '0.0.0.0', () => {
    console.log('Backend running on http://0.0.0.0:5000');
});
