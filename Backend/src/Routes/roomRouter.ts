import { PrismaClient } from "@prisma/client";
import AuthMiddleware from "../AuthMiddleware"
import express, { Request, Response } from "express";

const prisma = new PrismaClient();
const roomRouter = express.Router()
roomRouter.use(AuthMiddleware)

interface ExtendedRequest extends Request {
  userId:string,
}

roomRouter.get("/loadstate/:roomId",async (req:Request,res:Response)=>{
   try { const roomId = req.params.roomId; 

    const Messages = await prisma.chat.findMany({
                where: { roomId },
                orderBy: { createdAt: "desc" },
                take: 15,
                select: {
                  id: true,
                  type:true,
                  displayname: true,
                  edited: true,
                  multipleVotes: true,
                  time: true,
                  message: true,
                  options: {
                    select: {
                      chatId:true,
                      option: true,
                      id: true,
                      votes: {
                        select: {
                          chatId:true,
                          id: true,
                          user:  {
                            select:{
                                id:true,
                                displayname:true,
                                username:true,
                            }
                        },
                          optionId: true,
                        },
                      },
                    },
                  },
                  replyTo: {
                    select: {
                      id: true,
                      displayname: true,
                      edited: true,
                      time: true,
                      message: true,
                    },
                  },
                },
              });
           
                   
         const playing = await prisma.room.findFirst({
                        where: {
                          userId:roomId,
                        },
                        select: {
                          playingId: true,
                          playingTitle: true,
                          playingType: true,
                          playingAnimeId: true,
                        },
                      });
            
       const oldMessages = Messages.reverse()
            res.status(200).json({oldMessages, playing})
            }catch(error){
            res.status(400).json({
                msg:"error while loading room state"
            })
              }
            
})
//@ts-ignore
roomRouter.get("/currentState/:roomId",async (req:ExtendedRequest,res:Response)=>{
  try{const userId = req.userId;
   const roomId = req.params.roomId; 

   const pastState = await prisma.room.findFirst({
          where:{
              userId:roomId
          },
          select:{
              isPlaying:true,
              currentTime:true,
          }
        })
  
       res.status(200).json({
        isPlaying:pastState?.isPlaying, 
        currentTime:pastState?.currentTime
       })}catch(error) {
        res.status(400).json({msg:"Problem faced while loading the last state"})
       }

})

roomRouter.get("/getRoomName/:roomId",async (req:Request, res:Response)=>{
try{const roomId:string = req.params.roomId
 const roomDetails = await prisma.user.findFirst({
  where:{
    id:roomId
  },
select:{
 username:true,
 displayname:true, 
}})
 res.status(200).json({
  roomDetails
 })

}catch(error){
  res.status(400).json({
    msg:"Either you are not looged in or internal server error"
  })
}

})





export default roomRouter;