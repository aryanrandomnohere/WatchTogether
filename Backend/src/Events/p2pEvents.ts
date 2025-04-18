import { log } from "console";
import { Server, Socket } from "socket.io";
import { roomManager } from "../roomManager";


export default function p2pEvents(io:Server,socket:Socket){
socket.on("initiate-offer",(roomId:string,userInfo,to:string | null,sdp:RTCSessionDescriptionInit)=>{
    console.log(roomId,userInfo,to,sdp,"initiate-offer");
    const room =  roomManager.getInstance().getRoom(roomId);
    if(!room) {
        socket.emit("initiate-offer-error",{msg:"Something went wrong"});
        return;
    }
    if(room.inCall?.people?.size === 1){
        const sdp = room.inCall?.firstOffer;
        if(!sdp) return;
        io.to(userInfo.id).emit("initiate-offer",`${userInfo.displayname || userInfo.username} started a call`,sdp,userInfo.id);
        return;
    }
    if(roomManager.getInstance().getRoom(roomId)?.inCall?.people?.has(userInfo.id)){ 
        io.to(userInfo.id).emit("multiple-call-error","A call is already started cannot make an offer"); 
        return;
    }
    roomManager.getInstance().joinCall(roomId,userInfo.id,sdp)
    if(!to) return;
    io.to(to).emit("initiate-offer",`${userInfo.displayname || userInfo.username} started a call`,sdp,userInfo.id);
})

socket.on("answer-created",(roomId:string,userId:string,forUserId:string,sdp:any)=>{
    if(userId === forUserId) return null;
    io.to(userId).emit("answer-created","",sdp)
})
socket.on('ice-candidate',({userId,to,candidate}:{userId:string,to:string,candidate:RTCIceCandidate})=>{
    if(userId === to || to === null) return null;
    io.to(to).emit("ice-candidate",{from:userId,candidate})
    return
})

}
