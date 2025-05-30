import { Server, Socket } from "socket.io";
import { roomManager } from "../roomManager.js";

export default function p2pEvents(io: Server, socket: Socket) {

  socket.on("join-call", (roomId: string, userId: string) => {
    console.log("Joining call:", roomId, userId);
    const room = roomManager.getInstance().getRoom(roomId);
    if (!room) {
      socket.emit("join-call-error", { msg: "Room not found" });
      return;
    }
    room.inCall?.people.add(userId);
    socket.emit("join-call-success", { msg: "Joined call" });
  });
  
  // Handle offer initiation
  socket.on(
    "initiate-offer",
    (
      roomId: string,
      userInfo,
      to: string | null,
      sdp: RTCSessionDescriptionInit,
    ) => {
      

      const room = roomManager.getInstance().getRoom(roomId);
      if (!room) {
        socket.emit("initiate-offer-error", { msg: "Room not found" });
        return;
      }

      // Store the user's offer in the room and mark them as in the call
      roomManager
        .getInstance()
        .joinCall(roomId, userInfo.id);

      // If this is the first person joining (no specific target)
      if (!to) {
        // Just broadcast that a call is active in the room
        io.to(`${roomId}'room`).emit("call-status", true);
        return;
      }

      // Otherwise, send the offer to the specific target user
      io.to(to).emit(
        "initiate-offer",
        `${userInfo.displayname || userInfo.username} wants to connect`,
        sdp,
        userInfo.id,
      );
    },
  );

  // Handle answer creation
  socket.on(
    "answer-created",
    (
      roomId: string,
      userId: string,
      toUserId: string,
      answer: RTCSessionDescriptionInit,
    ) => {

      const room = roomManager.getInstance().getRoom(roomId);
      if (!room) {
        console.log("Room not found for answer");
        return;
      }

      // Add user to call if they're not already in
      if (!room.inCall?.people?.has(userId)) {
        roomManager.getInstance().joinCall(roomId, userId);
      }
      if(toUserId === userId) {
        console.log("Sending answer to self will sort out later")
        return;
      }
      console.log("Sending answer to:", toUserId , "from:", userId);
      // Send the answer back to the user who sent the offer
      io.to(toUserId).emit("answer-created", userId, answer);
    },
  );

  // Handle ICE candidate exchange
  socket.on(
    "ice-candidate",
    ({
      userId,
      to,
      candidate,
    }: {
      userId: string;
      to: string;
      candidate: RTCIceCandidate;
    }) => {

      if (userId === to || !to) {
        console.log("Invalid ICE candidate target");
        return;
      }

      // Forward ICE candidate to the other peer
      io.to(to).emit("ice-candidate", { from:userId, candidate });
    },
  );

  // Handle leaving call
  socket.on("leave-call", (roomId: string, userId: string) => {
    console.log(`User ${userId} leaving call in room ${roomId}`);

    const room = roomManager.getInstance().getRoom(roomId);
    if (!room || !room.inCall) return;

    // Remove user from call
    room.inCall.people.delete(userId);

    // If no one is left in the call, mark the call as inactive
    if (room.inCall.people.size === 0) {
      io.to(`${roomId}'room`).emit("call-status", false);
    } else {
      // Notify other participants that this user has left
      io.to(`${roomId}'room`).emit("leave-call", userId);
    }
  });

  socket.on("consumer",(sdp:RTCSessionDescription, roomId:string,consumerId:string,broadcaster:string)=>{
    const room = roomManager.getInstance().getRoom(roomId);
    if(!room){
      socket.emit("consumer-error","Room does not exist")
    }
    io.to(broadcaster).emit("consumer",sdp,consumerId)
  })
  socket.on("consumer-candidate",(candidate:RTCIceCandidate,consumerId:string,broadcaster:string)=>{
   io.to(broadcaster).emit("consumer-candidate",candidate,consumerId)
  })

  socket.on("broadcaster-answer",(answer:RTCSessionDescription, consumerId)=>{
    io.to(consumerId).emit("broadcaster-answer",answer)
  })

  socket.on("broadcaster-candidate", (candidate:RTCIceCandidate,consumerId:string)=>{
  io.to(consumerId).emit("broadcaster-candidate", candidate);
  })


}
