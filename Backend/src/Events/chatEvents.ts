import { PrismaClient } from "@prisma/client";
import { log } from "console";
import { SocketAddress } from "net";
import { Server, Socket } from "socket.io";

const prisma = new PrismaClient();

export default function chatEvents(io: Server, socket: Socket) {
  // Shared select clause for message fetching


interface Message {
  id: number;
  type:string;
  displayname: string;
  edited: boolean;
  multipleVotes: boolean;
  time: string;
  message: string;
  options?: Option[]; 
  replyTo?: Reply; 
}

interface Option {
  chatId:number;
  option: string;
  id: number;
  votes?: Vote[]; 
}

interface Vote {
  chatId:number;
  userId:string;
  id: number;
  optionId: number;
  user: User;
}

interface User {
  id: string;
  displayname: string;
  username: string; 
}

interface Reply {
  id: number;
  displayname: string;
  edited: boolean;
  time: string;
  message: string;
}

interface isPlayingType {
  id:number | string;
  title: string | undefined;
  type:string;
  animeId?:string | undefined;
}

  const messageSelect = {
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
            user: {
              select: {
                id: true,
                displayname: true,
                username: true,
              },
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
        message: true,
      },
    },
  };

  socket.on(
    "send-message",
    async ({
      type,
      time,
      message,
      options,
      roomId,
      multipleVotes= false,
      replyTo,
      displayname,
    }: {
      displayname: string;
      type: string;
      name: string;
      multipleVotes?: boolean;
      replyTo?: number;
      options?: string[];
      time: string;
      message: string;
      roomId: string;
    }) => {
        log({
          type,
          time,
          message,
          options,
          roomId,
          multipleVotes,
          replyTo,
          displayname,
    })
      try {
        if (type === "normal") {
          const newMessage = await prisma.chat.create({
            data: { displayname, type, message, time, roomId },
            select: messageSelect,
          });
          io.to(roomId).emit("receive-message", newMessage);
        } else if (type === "poll" && options) {
          try {
         
            const newPoll = await prisma.chat.create({
              data: {
                type: "poll",
                displayname,
                message,
                multipleVotes,
                time,
                roomId,
              },
              select: { id: true },
            });

            await Promise.all(
              options.map((option) =>
                prisma.pollOptions.create({
                  data: { option, chatId: newPoll.id },
                })
              )
            );

            const newMessage = await prisma.chat.findUnique({
              where: { id: newPoll.id },
              select: messageSelect,
            });

            io.to(roomId).emit("receive-message", newMessage);
          } catch (error) {
            console.error("Error creating poll or options:", error);
            socket.emit(
              "error-saving-message",
              "Failed to create poll or options."
            );
          }
        } else { 
          if(type == "replyTo" && replyTo){
            log("Its an Reply to message")
         try{   const newMessage =  await prisma.chat.create({
              data:{
               message,
               time,
               roomId,
               replyToId:replyTo,
               type,
               displayname
              },
              select:messageSelect
            }) 
           io.to(roomId).emit("receive-message",newMessage) } catch(error){
            console.error("Error saving message:", error);
            socket.emit("error-saving-message", "Failed to save message.");
           }
        }else{
          socket.emit("error-saving-message", "Invalid message type or data.");
        }
        }
      } catch (error) {
        console.error("Error saving message:", error);
        socket.emit("error-saving-message", "Failed to save message.");
      }
    }
  );


  socket.on(
    "new-vote",
    async ({ chatId, optionId, userId, roomId }: { chatId: number; optionId: number; userId: string; roomId: string }) => {
      try {
        // Fetch the chat details
        
        const chat = await prisma.chat.findUnique({
          where: { id: chatId },
          select: { multipleVotes: true },
        });
  
        if (!chat) {
          throw new Error("Chat not found");
        }
  
        let newVote;
        let newPoll;
        // Check if a vote already exists for this user and chat
        const existingVote = await prisma.vote.findFirst({
          where: { chatId, userId, optionId },
          select: { id: true },
        });
  
        if (chat.multipleVotes) {
          // Toggle the vote if multiple votes are allowed
          if (existingVote) {
            const deletedVote = await prisma.vote.delete({ where: { id: existingVote.id },
              select:{
                id:true,
                userId:true,
                chatId:true,
                optionId:true,
                user:{
                  select:{
                    username:true,
                    id:true,
                    displayname:true,
                  }
                }
          } });
          newPoll = await prisma.chat.findUnique({
            where:{
              id:chatId
            },
            select:messageSelect
          })
        
            io.to(roomId).emit("new-poll", newPoll);
            return;
          }
  
          newVote = await prisma.vote.create({
            data: { chatId, optionId, userId },
            select:{
              id:true,
              chatId:true,
              optionId:true,
              user:{
                select:{
                  username:true,
                  id:true,
                  displayname:true,
                }
              }
            }
          });

          newPoll = await prisma.chat.findUnique({
            where:{
              id:chatId
            },
            select:messageSelect
          })
        } else {
          // If multiple votes are not allowed, delete all user votes for this chat
          if (existingVote) {
            const deletedVote = await prisma.vote.delete({
              where: { id:existingVote.id },
              select:{
                id:true,
                userId:true,
                chatId:true,
                optionId:true,
                user:{
                  select:{
                    username:true,
                    id:true,
                    displayname:true,
                  }
                }
          }});
          newPoll = await prisma.chat.findUnique({
            where:{
              id:chatId
            },
            select:messageSelect
          })
        
            io.to(roomId).emit("new-poll", newPoll);
            return;
          }
  
         const deleteMany = await prisma.vote.deleteMany({
            where: { chatId, userId },  
          });
  
          newVote = await prisma.vote.create({
            data: { chatId, optionId, userId },
            select:{
              id:true,
              chatId:true,
              optionId:true,
              user:{
                select:{
                  username:true,
                  id:true,
                  displayname:true,
                }
              }
            }
          });


        }
     
        // Emit the new vote to all clients in the room
        newPoll = await prisma.chat.findUnique({
          where:{
            id:chatId
          },
          select:messageSelect
        })

       
          io.to(roomId).emit("new-poll", newPoll);
      } catch (error) {
        console.error("Error handling new vote:", error);
        socket.emit("error", "Failed to process vote.");
      }
    }
  );
  socket.on("deleteMessage", async ({roomId, chatId}:{roomId:string,chatId:number})=>{
    log(roomId,chatId)
  try {const deletedMessage = await prisma.chat.delete({
    where:{
      id:chatId
    },
    select:{
      id:true,
    }
  })
  
  io.to(roomId).emit("receive-deletedMessage", deletedMessage.id)
  
}catch(error){ 

  log("Something went wrong while deleting msg",error)
}
  })
}







