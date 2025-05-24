// server.js
import { Server } from "socket.io";
import wrtc from '@koush/wrtc';
import http from "http";
import { SsManager } from "./SsManager.js";

const { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } = wrtc;

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*", // Allow WebSocket connections from any domain
    methods: ["GET", "POST"],
  },
});
enum deleteType {
  FULL,
  CONSUMER
}

io.on("connection", (socket) => {
  if(!socket.handshake.query['userId']) return;
  console.log(socket.handshake.query["userId"]);
  socket.join(socket.handshake.query['userId'].toString());
  const sendIceCandidate = ({
    to,
    candidate,
  }: {
    to: string;
    candidate: RTCIceCandidate;
  }) => {
    console.log('Sending ICE candidate to:', to);
    io.to(to.toString()).emit('server-ice-candidate', { candidate });
  };

  socket.on('/consumer', async (sdp, roomId, userId) => {
     const consumer =  SsManager.getInstance().addConsumer(socket.id,roomId,userId,new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    }))
    const broadcaster = SsManager.getInstance().getBraodcaster(roomId);
    if (!consumer || !broadcaster) {
      console.log("Consumer or broadcaster not found");
      return;
    }
    consumer.onicecandidate = (event) => {
      if (event.candidate) {
        sendIceCandidate({ to: userId, candidate: event.candidate });
      }
    };

    const desc = new RTCSessionDescription(sdp);
    await consumer.setRemoteDescription(desc);
    
    if (broadcaster.stream) {
      const tracks = broadcaster.stream.getTracks();
      console.log('Adding tracks to consumer:',tracks.length);
      
      for (const track of tracks) {
        consumer.addTrack(track, broadcaster.stream);
      }
    }

    const answer = await consumer.createAnswer();
    await consumer.setLocalDescription(answer);
    
   
    
    io.to(userId.toString()).emit("ss-answer", { answer });
  });

  // Broadcast endpoint
  socket.on('/broadcast', async (sdp: RTCSessionDescriptionInit, roomId: string, userId: string) => {
    const broadcaster  = SsManager.getInstance().addBroadcaster(
      socket.id,
      roomId,
      userId,
      new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      })
    );
    if(!broadcaster || !broadcaster.peer){
      console.log("Failed to create broadcaster");
      return;
    }
      broadcaster.peer.ontrack = (event) => {
      console.log("Received track from broadcaster:", event.track.kind);
      const stream = event.streams[0];
      broadcaster.stream = stream;
      SsManager.getInstance().updateBroadcasterStream(roomId, stream);
      console.log(broadcaster.stream);
      console.log('Received tracks from broadcaster:', 
        broadcaster.stream.getTracks().map(track => ({
          kind: track.kind,
          enabled: track.enabled,
          muted: track.muted
        }))
      );
    };
 
    broadcaster.peer.onicecandidate = event => {
      if (event.candidate) {
        console.log("Broadcaster's ice candidate generated:", event.candidate)
        sendIceCandidate({ to: userId, candidate: event.candidate });
      }
    };
    const desc = new RTCSessionDescription(sdp);
    await broadcaster.peer.setRemoteDescription(desc);
   
    
    const answer = await broadcaster.peer.createAnswer();
    await broadcaster.peer.setLocalDescription(answer);
    console.log("Sending answer to broadcaster:", userId);
    io.to(userId).emit("ss-answer", { answer });
  });

  socket.on("client-ice-candidate", (type: string,roomId:string, candidate: RTCIceCandidate) => {
    const consumer = SsManager.getInstance().getConsumer(socket.id,roomId);
    const broadcaster = SsManager.getInstance().getBraodcaster(roomId);
    if(!consumer || !broadcaster || !broadcaster.peer) return
    if (type === "broadcaster") {
      broadcaster?.peer?.addIceCandidate(new RTCIceCandidate(candidate));  
    } else {
      consumer?.addIceCandidate(new RTCIceCandidate(candidate));
    }
  });
  socket.on("disconnect",()=>{
  const deleteResult = SsManager.getInstance().handleDisconnection(socket.id)
  if(deleteResult === deleteType.FULL){
    console.log("Room deleted due to broadcaster disconnect");
    // Notify remaining clients if needed
  } else if (deleteResult === deleteType.CONSUMER) {
    console.log("Consumer removed from room");
  }
  })
});

// Start server
server.listen(5002, () => {
  console.log('Server running on port 5002');
});