import { log } from "console";
import { Server, Socket } from "socket.io";
interface peopleType {
    displayname: string;
    username:string;
    userId:string;
    avatar:string;
  }

let senderId: null | string = null;
let receiverIds: null | string[] = null;
export default function p2pEvents(io:Server,socket:Socket){
socket.on("initiate-offer",(roomId:string,userInfo,peoples:string[],sdp:any)=>{
  log(roomId,userInfo,sdp,peoples)
if(receiverIds?.includes(userInfo.id)){ 
  io.to(userInfo.id).emit("multiple-call-error","A call is already started cannot make an offer"); 
  return;
}
senderId= userInfo.id;
receiverIds = peoples.filter((people)=> people !== userInfo.id);
if(receiverIds.length < 1) return

for(let receiver of receiverIds ){
  log(`sending to ${receiver}`)
    io.to(receiver).emit("offer-made",`${userInfo.username} started a call`,sdp)
}
})

socket.on("answer-created",(roomId:string,userId:string,sdp:any)=>{
if(senderId == userId) return;
 

if (!senderId){
   io.to(userId).emit("create-answer-error", "Call initiator ended the call or some internal server error")
   return
}
if(receiverIds){
for(let receiver of receiverIds ){
  if(receiver == userId) return
    io.to(receiver).emit("answer-created",`${userId} accepted the call`,sdp)
}}
io.to(senderId).emit("answer-created",`${userId} accepted the call`,sdp)
})
}