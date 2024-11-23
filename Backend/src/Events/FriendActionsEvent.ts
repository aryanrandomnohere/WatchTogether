import { PrismaClient } from "@prisma/client";
import { Server, Socket } from "socket.io";
const prisma = new PrismaClient();
export default function FriendActionEvents(io:Server,socket:Socket) {
socket.on("send-invite",(from,fromUsername,to)=>{
  io.to(to).emit("receive-invite-request",fromUsername, from);
});

socket.on("request-join", (from,fromUsername, to)=>{
    io.to(to).emit("receive-join-request",fromUsername, from);
});
}