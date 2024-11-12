import { PrismaClient } from "@prisma/client";
import { Server, Socket } from "socket.io";
const prisma = new PrismaClient();
export default function chatEvents(io:Server,socket:Socket){
    socket.on("send-message", async ({ name, time, message, userId }: { name: string, time: string, message: string, userId: string }) => {
        try {
            const newMessage = await prisma.chat.create({
                data: { name, message, time, userId },
            });
            io.to(userId).emit("receive-message", newMessage);
        } catch (error) {
            console.error("Error saving message:", error);
            socket.emit("error-saving-message", "Failed to save message.");
        }
    });
}