import { PrismaClient } from "@prisma/client";
import { Server, Socket } from "socket.io";
const prisma = new PrismaClient();
export default function FriendActionEvents(io:Server,socket:Socket) {
socket.on("send-invite",(from,to)=>{
  io.to(to).emit("receive-invite-request",from);
});

socket.on("request-join", (from, to)=>{
    io.to(to).emit("receive-join-request",from);
});
}