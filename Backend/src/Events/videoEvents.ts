import { log } from "console";
import { Server, Socket } from "socket.io";
import { number } from "zod";
import { roomManager } from "../roomManager";
import { prisma } from "../db";;

export default function videoEvents(io:Server, socket:Socket) {
    socket.on("change-video", async({playing,roomId}:{playing:{id:string, title:string, type:string, animeId?:string},roomId:string})=>{
       try{ 
        let newPlaying;
        const room = roomManager.getInstance().getRoom(roomId)
        if(room?.roomStatus){
         room.roomStatus.playingId=playing.id;
         room.roomStatus.playingTitle=playing.title;
         room.roomStatus.playingType=playing.type;
         room.roomStatus.playingAnimeId=playing.animeId || undefined;
        newPlaying = {playingId:playing.id, playingTitle:playing.title, playingType:playing.type, playingAnimeId:playing.animeId}
         log("video data stored in the local vaiable and sent to the other subscribres")
         log(room.roomStatus)
        } else{
            newPlaying = await prisma.room.update({
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
    }
        
    io.to(roomId).emit("receive-playing", newPlaying)
    }catch(error){
            console.error("Error saving video:", error);
        }
    })

    socket.on("change-ep",async(episode:number,season:number,roomId:string)=>{
        try{
            const room = roomManager.getInstance().getRoom(roomId)
            if(room?.roomStatus){
            room.roomStatus.episode = episode;
            room.roomStatus.season = season
             log("ep stored locally")
            } else{

        await prisma.room.update({
        where:{
         userId:roomId
        },
        data:{
         episode,
         season
        } 
    })
}
    io.to(roomId).emit("receive-ep",episode,season)}
    catch (error) {
        log(`Error while changing ep ${error}`)
    }
    })
    socket.on("playPause",async ({isPlaying,roomId}:{isPlaying:boolean,roomId:string})=>{
        const room = roomManager.getInstance().getRoom(roomId)
        if(room?.roomStatus){
        room.roomStatus.isPlaying=isPlaying;
        } else {
           await prisma.room.update({
            where:{
                userId:roomId
            },
            data:{
                isPlaying
            },
            select:{
                isPlaying:true,
            }
        })
    }
        const playerRoom = roomId+"'s Player"
        io.to(playerRoom).emit("receivePlayPause", isPlaying)
        return 
    })
    
    socket.on("seek",async ({currentTime,roomId}:{currentTime:number,roomId:string})=>{
        const room = roomManager.getInstance().getRoom(roomId)
        if(room?.roomStatus){
        room.roomStatus.currentTime=currentTime;
         } else {
            await prisma.room.update({
            where:{
                userId:roomId
            },
            data:{
            currentTime
            },
            select:{
                currentTime:true
            }
         })
     }
    const playerRoom = roomId+"'s Player"
        io.to(playerRoom).emit("receiveSeek",{currentTime})
    })
     
    socket.on("join-player",({roomId}:{roomId:string})=>{
    const playerRoom = roomId+"'s Player"
    socket.join(playerRoom)
    })

}