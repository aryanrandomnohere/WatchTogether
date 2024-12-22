import { PrismaClient } from "@prisma/client";
import { log } from "console";
import { Server, Socket } from "socket.io";
const prisma = new PrismaClient();

export default function videoEvents(io:Server, socket:Socket) {
    socket.on("change-video", async({playing,roomId}:{playing:{id:string, title:string, type:string, animeId?:string},roomId:string})=>{
     console.log(playing);
     log(roomId)
       try{ 
        const newPlaying = await prisma.room.update({
            where:{userId:roomId},
            data:{
                playingId:playing.id,
                playingTitle:playing.title,
                playingType:playing.type,
                playingAnimeId:playing.animeId,
            },
            select:{
                playingId:true,
                playingTitle:true,
                playingType:true,
                playingAnimeId:true,
            }
        })
        console.log(newPlaying);
        
    io.to(roomId).emit("receive-playing", newPlaying)
    }catch(error){
            console.error("Error saving video:", error);
        }
    })

    socket.on("change-ep",async(episode:number,season:number,roomId:string)=>{
        try{
    await prisma.room.update({
        where:{
         userId:roomId
        },
        data:{
         episode,
         season
        }
       
    })
    io.to(roomId).emit("receive-ep",episode,season)}
    catch (error) {
        log(`Error while changing ep ${error}`)
    }
    })
}