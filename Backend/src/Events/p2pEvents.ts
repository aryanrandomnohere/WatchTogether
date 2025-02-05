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
  log("frontend is hitting")
if(receiverIds?.includes(userInfo.id)){ 
  io.to(userInfo.id).emit("multiple-call-error","A call is already started cannot make an offer"); 
  return;
}
senderId= userInfo.id;
receiverIds = peoples.filter((people)=> people !== userInfo.id);
if(receiverIds.length < 1) return

for(let receiver of receiverIds ){
log("sending-iniated-offer",receiver)
    io.to(receiver).emit("initiate-offer",`${userInfo.username} started a call`,sdp)
}
})

socket.on("answer-created",(roomId:string,userId:string,sdp:any)=>{
console.trace(senderId,userId);

if(senderId == userId){ 
  console.log(senderId, userId);
  return;
}
 

if (!senderId){
   io.to(userId).emit("create-answer-error", "Call initiator ended the call or some internal server error")
   return
}
if(receiverIds && receiverIds?.length>1){
  const otherReceivers = receiverIds.filter((receiver)=>{
    receiver !== userId
  })
  
for(let receiver of otherReceivers ){
  if(receiver == userId) return
   console.log(`sending to ${receiver}`);
   
    io.to(receiver).emit("answer-created",`${userId} accepted the call`,sdp)
}}
console.log(senderId);
io.to(senderId).emit("answer-created",`${userId} accepted the call`,sdp)
})

socket.on('ice-candidate',({userId,candidate}:{userId:string,candidate:any})=>{
if(userId === senderId){
  if(!receiverIds ||  receiverIds?.length == 0 ) return
  for(let receiver of receiverIds){
    io.to(receiver).emit("receiver-ice-candidate",candidate)
  }
return
}
if(receiverIds?.includes(userId)){
  const otherReceivers = receiverIds.filter((receiver)=>{
    receiver !== userId
  })
  if(otherReceivers.length > 0) {
  for(let receiver of otherReceivers){
    io.to(receiver).emit("receiver-ice-candidate",candidate)
  }
}
if(!senderId) return
  io.to(senderId).emit("sender-ice-candidate",candidate)
}

})
}