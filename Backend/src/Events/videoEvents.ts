import { PrismaClient } from "@prisma/client";
import { Server, Socket } from "socket.io";
const prisma = new PrismaClient();

export default function videoEvents(io:Server, socket:Socket) {
    socket.on("change-video", async({url,roomId}:{url:string,roomId:string})=>{
        console.log(url);
        
       try{ 
        const playing = await prisma.room.update({
            where:{userId:roomId},
            data:{playing:url},
            select:{playing:true}
        })
        console.log(playing);
        
    io.to(roomId).emit("receive-playing", playing)
    }catch(error){
            console.error("Error saving video:", error);
        }
    })
}
