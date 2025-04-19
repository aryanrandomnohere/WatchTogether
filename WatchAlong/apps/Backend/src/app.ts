// import express from "express";
// import { Server } from "socket.io";
// import http from "http";
// import cors from "cors";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();
// const app = express();
// const port = 8000;

// app.use(cors());

// // Create an HTTP server
// const server = http.createServer(app);

// // Track users in each room
// const rooms: Record<string, Set<string>> = {};

// // Initialize Socket.io with the HTTP server
// const io = new Server(server, {
//     cors: {
//         origin: "http://localhost:5173",  // replace with client’s origin if different
//         methods: ["GET", "POST"]
//     }
// });

// // Listen for incoming connections from clients
// io.on("connection", (socket) => {
//     console.log(`A user connected: ${socket.id}`);

//     socket.on("join-room", async (userId) => {
//         socket.join(userId);

//         // Add the user to the room
//         if (!rooms[userId]) {
//             rooms[userId] = new Set();
//         }
//         rooms[userId].add(socket.id);

//         // Emit the user count for the room
//         io.to(userId).emit("room-user-count", rooms[userId].size);

//         try {
//             const oldMessages = await prisma.chat.findMany({
//                 where: { userId },
//                 orderBy: { createdAt: "desc" },
//                 take: 10,
//                 select: { name: true, time: true, message: true }
//             });

//             const playing = await prisma.room.findFirst({
//                 where:{
//                     userId
//                 },
//                 select:{
//                     playing:true
//                 }
//             })

//             socket.emit("load-messages", oldMessages.reverse());
//             socket.emit("load-playing", playing);
//         } catch (error) {
//             console.error("Error fetching messages:", error);
//             socket.emit("error-loading-messages", "Failed to load previous messages.");
//         }
//     });

//     socket.on("change-video", async({url,roomId})=>{
//         console.log(url);
        
//        try{ 
//         const playing = await prisma.room.update({
//             where:{userId:roomId},
//             data:{playing:url},
//             select:{playing:true}
//         })
//         console.log(playing);
        
//     io.to(roomId).emit("receive-playing", playing)
//     }catch(error){
//             console.error("Error saving video:", error);
//         }
//     })

//     socket.on("send-message", async ({ name, time, message, userId }: { name: string, time: string, message: string, userId: string }) => {
//         try {
//             const newMessage = await prisma.chat.create({
//                 data: { name, message, time, userId },
//             });
//             io.to(userId).emit("receive-message", newMessage);
//         } catch (error) {
//             console.error("Error saving message:", error);
//             socket.emit("error-saving-message", "Failed to save message.");
//         }
//     });

//     // Handle disconnection
//     socket.on("disconnect", () => {
//         console.log(`User disconnected: ${socket.id}`);

//         // Remove the user from any room they were in
//         for (const roomId in rooms) {
//             rooms[roomId].delete(socket.id);
//             if (rooms[roomId].size === 0) {
//                 delete rooms[roomId];  // Clean up empty rooms
//             } else {
//                 io.to(roomId).emit("room-user-count", rooms[roomId].size);
//             }
//         }
//     });
// });

// // Start the server
// server.listen(port, () => {
//     console.log(`Server is listening on port ${port}`);
// });
