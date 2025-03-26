"use strict";
// import { log } from "console";
// import { Server, Socket } from "socket.io";
// import { roomManager } from "../roomManager";
// export default function p2pEvents(io:Server,socket:Socket){
// socket.on("initiate-offer",(roomId:string,userInfo, peoples:string[],sdp:any)=>{
//   const room =  roomManager.getInstance().getRoom(roomId)
//   log("frontend is hitting")
// if(roomManager.getInstance().getRoom(roomId)?.inCall?.Receivers?.includes(userInfo.id)){ 
//   io.to(userInfo.id).emit("multiple-call-error","A call is already started cannot make an offer"); 
//   return;
// }
// senderId= userInfo.id;
// receiverIds = peoples.filter((people)=> people !== userInfo.id);
// if(receiverIds.length < 1) return
// for(let receiver of room.inCall?.Receivers){
// log("sending-iniated-offer",receiver)
//     io.to(receiver).emit("initiate-offer",`${userInfo.displayname || userInfo.username} started a call`,sdp)
// }
// })
// socket.on("answer-created",(roomId:string,userId:string,sdp:any)=>{
// if(senderId == userId){ 
//   console.log(senderId, userId);
//   return;
// }
// if (!senderId){
//    io.to(userId).emit("create-answer-error", "Call initiator ended the call or some internal server error")
//    return
// }
// if(receiverIds && receiverIds?.length>1){
//   const otherReceivers = receiverIds.filter((receiver)=>{
//     receiver !== userId
//   })
// for(let receiver of otherReceivers ){
//   if(receiver == userId) return
//    console.log(`sending to ${receiver}`);
//     io.to(receiver).emit("answer-created",`${userId} accepted the call`,sdp)
// }}
// console.log(senderId);
// io.to(senderId).emit("answer-created",`${userId} accepted the call`,sdp)
// })
// socket.on('ice-candidate',({userId,candidate}:{userId:string,candidate:any})=>{
// if(userId === senderId){
//   if(!receiverIds ||  receiverIds?.length == 0 ) return
//   for(let receiver of receiverIds){
//     io.to(receiver).emit("receiver-ice-candidate",candidate)
//   }
// return
// }
// if(receiverIds?.includes(userId)){
//   const otherReceivers = receiverIds.filter((receiver)=>{
//     receiver !== userId
//   })
//   if(otherReceivers.length > 0) {
//   for(let receiver of otherReceivers){
//     io.to(receiver).emit("receiver-ice-candidate",candidate)
//   }
// }
// if(!senderId) return
//   io.to(senderId).emit("sender-ice-candidate",candidate)
// }
// })
// }
