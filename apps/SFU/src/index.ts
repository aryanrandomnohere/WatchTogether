// server.js
import { Server } from "socket.io";
import wrtc, { MediaStream } from '@koush/wrtc';
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
  console.log("Connection made");
  if(!socket.handshake.query['userId']){
    console.log("UserId is not passed with the connection string ");
    return;
  }
  console.log(socket.handshake.query['userId']);
  socket.join(socket.handshake.query['userId'].toString());
  const sendIceCandidate = ({
    to,
    candidate,
  }: {
    to: string;
    candidate: RTCIceCandidate;
  }) => {
    // console.log('Sending ICE candidate to:', to);
    io.to(to.toString()).emit('server-ice-candidate', { candidate });
  };

  socket.on('consumer', async (sdp, roomId, userId) => {
     const consumer =  SsManager.getInstance().addConsumer(socket.id,roomId,userId,new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    }))
    const broadcaster = SsManager.getInstance().getBraodcaster(roomId);
    if (!consumer || !broadcaster) {
      console.log("Consumer or broadcaster not found");
      return;
    }
    console.log(consumer,broadcaster)
    console.log(SsManager.getInstance().getRoom(roomId))
    consumer.onicecandidate = (event) => {
      if (event.candidate) {
        sendIceCandidate({ to: userId, candidate: event.candidate });
      }
    };

    const desc = new RTCSessionDescription(sdp);
    await consumer.setRemoteDescription(desc);
    
    if (broadcaster.stream) {
      const tracks = broadcaster.stream.getTracks();
      console.log('🎥 Adding tracks to consumer:', tracks.length);
      console.log('🔍 Track details:', tracks.map(track => ({
        kind: track.kind,
        enabled: track.enabled,
        muted: track.muted,
        readyState: track.readyState
      })));
    
      for (const track of tracks) {
        console.log('➕ Adding track to consumer:', track.kind);
        consumer.addTrack(track, broadcaster.stream);
      }
    
      // 🔁 Periodically check track health
      const interval = setInterval(() => {
        console.log('📡 Checking broadcaster track status...');
        tracks.forEach((track, index) => {
          console.log(`🔄 Track ${index} (${track.kind}) status:`);
          console.log('   ▶️ enabled:', track.enabled);
          console.log('   🔇 muted:', track.muted);
          console.log('   📽️ readyState:', track.readyState);
    
          if (track.readyState !== 'live' || track.muted) {
            console.warn(`⚠️ Track ${index} is not healthy.`);
          } else {
            console.log(`✅ Track ${index} is healthy.`);
          }
        });
      }, 2000);
    } else {
      const broadcasterId = broadcaster.userId
      if(!broadcasterId) {
        io.to(userId).emit("screen-share-error")
        return 
      }
      console.log("Sending tracks to ",broadcasterId)
      io.to(broadcasterId).emit("add-tracks")
      const expectedTracks = 2; // audio + video
      let receivedTracks = 0;
      const receivedStream = new MediaStream();
      
      broadcaster.peer.ontrack = async (event) => {
        const clonedTrack = event.track.clone();
        receivedStream.addTrack(clonedTrack);
        broadcaster.stream = receivedStream;
        consumer.addTrack(clonedTrack, receivedStream);
      
        receivedTracks++;
        console.log(`Track ${receivedTracks} of ${expectedTracks} received`);
      
        if (receivedTracks === expectedTracks) {
          const answer = await consumer.createAnswer();
          await consumer.setLocalDescription(answer);
          io.to(userId.toString()).emit("ss-answer", { answer });
        }
      };
      setTimeout(async () => {
        if (!consumer.localDescription) {
          const answer = await consumer.createAnswer();
          await consumer.setLocalDescription(answer);
          io.to(userId.toString()).emit("ss-answer", { answer });
          console.warn("Sent answer with incomplete tracks (timeout fallback)");
        }
      }, 3000); // 3 seconds wait
      
    }
  });

  // Broadcast endpoint
  socket.on('broadcast', async (sdp: RTCSessionDescriptionInit, roomId: string, userId: string) => {
    console.log("Hit")
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
    //   broadcaster.peer.ontrack = (event) => {
    //   const stream = event.streams[0];
    //   broadcaster.stream = stream;
    //   SsManager.getInstance().updateBroadcasterStream(roomId, stream);
    //   console.log('Received tracks from broadcaster:', 
    //     broadcaster.stream.getTracks().map(track => ({
    //       kind: track.kind,
    //       enabled: track.enabled,
    //       muted: track.muted
    //     }))
    //   );
    // }
 
    broadcaster.peer.onicecandidate = event => {
      if (event.candidate) {
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
    // console.log("Received Ice candidate from:",type,candidate)
    const consumer = SsManager.getInstance().getConsumer(socket.id,roomId);
    const broadcaster = SsManager.getInstance().getBraodcaster(roomId);
    if(!consumer || !broadcaster || !broadcaster.peer) return
    console.log(consumer, broadcaster);
    if (type === "broadcaster") {
      console.log("BroadCaster sent his ice candidates")
      broadcaster?.peer?.addIceCandidate(new RTCIceCandidate(candidate));  
    } else {
      console.log("consumer sent his ice candidates")
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
server.listen(5003, () => {
  console.log('Server running on port 5003');
});