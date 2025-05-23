// server.js
import { Server } from "socket.io";
import wrtc from '@koush/wrtc';
import http from "http";

const { RTCPeerConnection, RTCSessionDescription } = wrtc;

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*", // Allow WebSocket connections from any domain
    methods: ["GET", "POST"],
  },
});

let senderStream: MediaStream;
let peer1: RTCPeerConnection | null;
let peer2: RTCPeerConnection | null;

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
    peer2 = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    const desc = new RTCSessionDescription(sdp);
    await peer2.setRemoteDescription(desc);
    
    if (senderStream && peer2) {
      const tracks = senderStream.getTracks();
      console.log('Adding tracks to consumer:', tracks.map(track => ({
        kind: track.kind,
        enabled: track.enabled,
        muted: track.muted
      })));
      
      for (const track of tracks) {
        peer2.addTrack(track, senderStream);
      }
    }

    const answer = await peer2.createAnswer();
    await peer2.setLocalDescription(answer);
    
    peer2.onicecandidate = (event) => {
      if (event.candidate) {
        sendIceCandidate({ to: userId, candidate: event.candidate });
      }
    };
    
    io.to(userId.toString()).emit("ss-answer", { answer });
  });

  // Broadcast endpoint
  socket.on('/broadcast', async (sdp: RTCSessionDescriptionInit, roomId: string, userId: string) => {
    console.log("Offer created by server")
    peer1 = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    peer1.ontrack = (event) => {
      senderStream = event.streams[0];
      console.log('Received tracks from broadcaster:', 
        event.streams[0].getTracks().map(track => ({
          kind: track.kind,
          enabled: track.enabled,
          muted: track.muted
        }))
      );
    };

    const desc = new RTCSessionDescription(sdp);
    await peer1.setRemoteDescription(desc);
    
    peer1.onicecandidate = event => {
      if (event.candidate) {
        console.log("Broadcaster's ice candidate generated:", event.candidate)
        sendIceCandidate({ to: userId, candidate: event.candidate });
      }
    };
    
    const answer = await peer1.createAnswer();
    await peer1.setLocalDescription(answer);
    console.log("Sending answer to client:", userId);
    io.to(userId).emit("ss-answer", { answer });
  });

  socket.on("client-ice-candidate", (type: string, candidate: RTCIceCandidate) => {
    if (type === "broadcaster") {
      peer1?.addIceCandidate(candidate);  
    } else {
      peer2?.addIceCandidate(candidate);
    }
  });
});

// Start server
server.listen(5002, () => {
  console.log('Server running on port 5002');
});