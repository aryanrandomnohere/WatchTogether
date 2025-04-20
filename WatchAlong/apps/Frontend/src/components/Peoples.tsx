import { useEffect, useRef, useState} from 'react';
import toast from 'react-hot-toast';
import { IoArrowBackCircleSharp } from 'react-icons/io5';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { chatType } from '../State/chatWindowState';
import { joinedStatus } from '../State/isJoined';
import { people } from '../State/roomPeopleState';
import { userInfo } from '../State/userState';
import getSocket from '../services/getSocket';
import CallNotification from './CallNotification';

enum ChatType {
  CHATS,
  POLL,
  VOTES,
}
interface P2pInstanceType {
  withUserId: string | null;
  instance: RTCPeerConnection;
}

const socket = getSocket();
export default function Peoples() {
  const setChatType = useSetRecoilState(chatType);
  const members = useRecoilValue(people);
  const Info = useRecoilValue(userInfo);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);
  const videoRef3 = useRef<HTMLVideoElement>(null);
  const p2pConnections = useRef<P2pInstanceType[]>([]);
  const { roomId } = useParams();
  const [isJoined, setIsJoined] = useRecoilState(joinedStatus);
  const [status, setStatus] = useState<boolean | null>(null);
 
  async function JoinNotification(msg: string) {
    toast.custom(t => (
      <CallNotification msg={msg} isJoined={isJoined} setIsJoined={setIsJoined} t={t} />
    ));
  }

  const sendIceCandidate = ({userId, to, candidate}: {userId: string, to: string, candidate: RTCIceCandidate}) => {
    console.log("Sending ICE candidate to:", to);
    socket.emit("ice-candidate", {userId, to, candidate});
    return;
  }

  const setIceCandidate = ({from, candidate}: {from: string, candidate: RTCIceCandidate}) => {
    console.log("Received ICE candidate from:", from);
    const index = p2pConnections.current.findIndex((conn) => conn.withUserId === from);
    if (index === -1) {
      console.error("Cannot find connection for ICE candidate from:", from);
      return;
    }
    p2pConnections.current[index].instance.addIceCandidate(candidate)
      .then(() => console.log("Successfully added ICE candidate"))
      .catch(err => console.error("Error adding ICE candidate:", err));
    return;
  }

  const getVideoRef = (index: number) => {
    switch(index) {
      case 0: return videoRef1;
      case 1: return videoRef2;
      case 2: return videoRef3;
      default: return null;
    }
  };

  async function createConnection({to}: {to: string | null}) {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });
    
    p2pConnections.current.push({
      withUserId: to,
      instance: peerConnection
    });
    
    const index = p2pConnections.current.length - 1;
    const videoRef = getVideoRef(index);
    
    if (!videoRef?.current) return null;

    try {
      // Set up ICE candidate handling
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          sendIceCandidate({ userId: Info.id, to: to || '', candidate: event.candidate });
        }
      };
      
      // Connection state monitoring
      peerConnection.onconnectionstatechange = () => {
        console.log("Connection state change:", peerConnection.connectionState, "with peer:", to);
      };
      
      peerConnection.oniceconnectionstatechange = () => {
        console.log("ICE connection state change:", peerConnection.iceConnectionState, "with peer:", to);
      };
      
      // Get local stream
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (!stream) {
        console.log("Stream not found");
        return null;
      }

      // Set up local video if not already set up
      if (localVideoRef.current && !localVideoRef.current.srcObject) {
        localVideoRef.current.srcObject = stream;
        await localVideoRef.current.play().catch(err => console.error("Error playing local video:", err));
      }

      // Add video track to the peer connection
      stream.getVideoTracks().forEach(track => {
        console.log("Adding local track to peer connection:", track.id);
        peerConnection.addTrack(track, stream);
      });

      // Handle incoming tracks
      peerConnection.ontrack = async (event) => {
        console.log("Received track in createConnection:", event.track);
        if (!videoRef.current) return;

        let remoteStream = videoRef.current.srcObject as MediaStream;
        if (!remoteStream) {
          remoteStream = new MediaStream();
          videoRef.current.srcObject = remoteStream;
        }

        if (!remoteStream.getTracks().some(t => t.id === event.track.id)) {
          remoteStream.addTrack(event.track);
          console.log("Added track to remote stream:", event.track.id);
        }

        try {
          await videoRef.current.play();
          console.log("Remote video playing successfully");
        } catch (err) {
          console.error("Error playing video:", err);
        }
      };

      // Create the offer
      console.log("Creating offer");
      const offer = await peerConnection.createOffer();
      console.log("Setting local description (offer)");
      await peerConnection.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error("Error in createConnection:", error);
      return null;
    }
  }

  async function CreateAnswer(sdp: RTCSessionDescriptionInit, from: string) {
    // Create peer connection with STUN servers
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });
    
    p2pConnections.current.push({
      withUserId: from,
      instance: peerConnection
    });
    
    const index = p2pConnections.current.findIndex((conn) => conn.withUserId === from);
    const videoRef = getVideoRef(index);
    
    if (!videoRef?.current) return null;

    try {
      // Set up ICE candidate handler first
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Sending ICE candidate to:", from);
          sendIceCandidate({ userId: Info.id, to: from, candidate: event.candidate });
        }
      };
      
      // Connection state monitoring
      peerConnection.onconnectionstatechange = () => {
        console.log("Connection state change:", peerConnection.connectionState, "with peer:", from);
      };
      
      peerConnection.oniceconnectionstatechange = () => {
        console.log("ICE connection state change:", peerConnection.iceConnectionState, "with peer:", from);
      };

      // Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (!stream) {
        console.log("Local stream not found");
        return null;
      }

      // Set up local video if not already set
      if (localVideoRef.current && !localVideoRef.current.srcObject) {
        localVideoRef.current.srcObject = stream;
        try {
          await localVideoRef.current.play();
        } catch (err) {
          console.error("Error playing local video:", err);
        }
      }

      // Add local tracks to the peer connection
      stream.getVideoTracks().forEach(track => {
        console.log("Adding local track to peer connection:", track.id);
        peerConnection.addTrack(track, stream);
      });

      // Handle incoming remote tracks
      peerConnection.ontrack = async (event) => {
        console.log("Received remote track from:", from, event.track);
        if (!videoRef.current) return;

        let remoteStream = videoRef.current.srcObject as MediaStream;
        if (!remoteStream) {
          remoteStream = new MediaStream();
          videoRef.current.srcObject = remoteStream;
        }

        // Add the track if it's not already in the stream
        if (!remoteStream.getTracks().some(t => t.id === event.track.id)) {
          remoteStream.addTrack(event.track);
          console.log("Added track to remote stream:", event.track.id);
        }

        // Try to play the video
        try {
          await videoRef.current.play();
          console.log("Remote video playing successfully");
        } catch (err) {
          console.error("Error playing remote video:", err);
        }
      };

      // Process the remote offer first
      console.log("Setting remote description (offer)");
      await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
      
      // Create and set local answer
      console.log("Creating answer");
      const answer = await peerConnection.createAnswer();
      console.log("Setting local description (answer)");
      await peerConnection.setLocalDescription(answer);

      return answer;
    } catch (error) {
      console.error("Error in CreateAnswer:", error);
      return null;
    }
  }
 
  function goBack() {
    setChatType(ChatType.CHATS);
  }

  async function handleStartCall() {
    try {
      console.log("Starting call");
      
      // Get local stream first
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      
      if (!stream) {
        console.error("Could not get local media stream");
        return;
      }

      // Set up local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        try {
          await localVideoRef.current.play();
        } catch (err) {
          console.error("Error playing local video:", err);
        }
      }

      // Get current call status from server
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_APP_API_BASE_URL}/api/v1/room/call/${roomId}`,
        {
          headers: {
            authorization: localStorage.getItem('token'),
          },
        }
      );

      const { callCount, sdp } = response.data;
      console.log("Call status from server:", { usersInCall: callCount, hasSdp: !!sdp });

      // Case 1: Joining an existing call with 1 person
      if (sdp && callCount.length === 1) {
        console.log("Joining call with user:", callCount[0]);
        const answer = await CreateAnswer(sdp, callCount[0]);
        if (answer) {
          console.log("Sending answer to initial caller");
          socket.emit("answer-created", roomId, Info.id, callCount[0], answer);
          setIsJoined(true);
        } else {
          console.error("Failed to create answer");
        }
        return;
      }

      // Case 2: Starting a new call (no one in the call)
      if (callCount.length < 1) {
        console.log("Starting a new call (no one in call)");
        const offer = await createConnection({ to: null });
        if (offer) {
          console.log("Emitting initial offer");
          socket.emit("initiate-offer", roomId, { 
            id: Info.id, 
            username: Info.username, 
            displayname: Info.displayname 
          }, null, offer);
          setIsJoined(true);
        }
        return;
      }

      // Case 3: Joining a call with multiple people
      console.log("Joining call with multiple people:", callCount);
      for (const userId of callCount) {
        console.log("Creating connection with user:", userId);
        const offer = await createConnection({ to: userId });
        if (offer) {
          console.log("Sending offer to user:", userId);
          socket.emit("initiate-offer", roomId, { 
            id: Info.id, 
            username: Info.username, 
            displayname: Info.displayname 
          }, userId, offer);
        }
      }
      setIsJoined(true);
    } catch (error) {
      console.error("Error in handleStartCall:", error);
    }
  }

  async function handleEndCall() {
    try {
      // Close all peer connections
      p2pConnections.current.forEach(conn => {
        conn.instance.close();
      });
      p2pConnections.current = [];
      
      // Clear all video elements
      if (localVideoRef.current) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          localVideoRef.current.srcObject = null;
        }
      }
      
      [videoRef1, videoRef2, videoRef3].forEach(ref => {
        if (ref.current) {
          const stream = ref.current.srcObject as MediaStream;
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
            ref.current.srcObject = null;
          }
        }
      });
      
      // Tell the server the user has left the call
      socket.emit("leave-call", roomId, Info.id);
      setIsJoined(false);
    } catch (error) {
      console.error("Error ending call:", error);
    }
  }

  useEffect(() => {
    console.log("Setting up socket event listeners");
    
    // Handle ICE candidates from other peers
    socket.on("ice-candidate", (data) => {
      console.log("Received ICE candidate from:", data.from);
      setIceCandidate(data);
    });
    
    // Handle answers to our offers
    socket.on("answer-created", (from: string, answer: RTCSessionDescriptionInit) => {
      console.log("Received answer from:", from);
      const index = p2pConnections.current.findIndex((conn) => conn.withUserId === from);
      if (index === -1) {
        console.error("Cannot find connection for user:", from);
        return;
      }
      
      const peerConnection = p2pConnections.current[index].instance;
      peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
        .then(() => {
          console.log("Successfully set remote description (answer)");
        })
        .catch(err => {
          console.error("Error setting remote description (answer):", err);
        });
    });
    
    // Handle call status updates
    socket.on("call-status", (callStatus: boolean) => {
      console.log("Call status updated:", callStatus);
      setStatus(callStatus);
    });
    
    // Handle incoming offers
    socket.on("initiate-offer", async (msg: string, sdp: RTCSessionDescriptionInit, from: string) => {
      console.log("Received offer from:", from);
      JoinNotification(msg);
      
      const answer = await CreateAnswer(sdp, from);
      if (answer) {
        console.log("Sending answer to:", from);
        socket.emit("answer-created", roomId, Info.id, from, answer);
      } else {
        console.error("Failed to create answer");
      }
    });
    
    // Cleanup function to remove all listeners
    return () => {
      console.log("Cleaning up socket event listeners");
      socket.off("ice-candidate");
      socket.off("answer-created");
      socket.off("call-status");
      socket.off("initiate-offer");
      
      // Close and clean up any existing peer connections
      p2pConnections.current.forEach(conn => {
        conn.instance.close();
      });
      p2pConnections.current = [];
      
      // Stop all media tracks
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Empty dependency array to run once on component mount

  return (
    <div className="flex flex-col w-full h-64 md:h-[40.5rem] border border-t-0 border-white/15">
      <div className="mx-3 mb-5 hover:cursor-pointer max-w-72" onClick={goBack}>
        <IoArrowBackCircleSharp className="text-3xl hover:text-slate-400" />
      </div>
      <div className="flex justify-between mx-3 h-full">
        {members &&
          members.map((p, index: number) => (
            <div key={index} className="w-1/2 border text-center h-fit">
              {p.displayname}
            </div>
          ))}
      </div>
      <div className="flex flex-wrap w-full h-full">
        <div className="w-1/2 p-2">
          <video 
            ref={localVideoRef} 
            className="w-full h-full object-cover rounded-lg" 
            autoPlay 
            playsInline
            muted
            onLoadedMetadata={async (e) => {
              try {
                await e.currentTarget.play();
              } catch (err) {
                console.error("Error playing local video on load:", err);
              }
            }}
          ></video>
          <div className="text-center mt-1">You</div>
        </div>
        <div className="w-1/2 p-2">
          <video 
            ref={videoRef1} 
            className="w-full h-full object-cover rounded-lg" 
            autoPlay 
            playsInline
            onLoadedMetadata={async (e) => {
              try {
                await e.currentTarget.play();
              } catch (err) {
                console.error("Error playing video 1 on load:", err);
              }
            }}
          ></video>
        </div>
        <div className="w-1/2 p-2">
          <video 
            ref={videoRef2} 
            className="w-full h-full object-cover rounded-lg" 
            autoPlay 
            playsInline
            onLoadedMetadata={async (e) => {
              try {
                await e.currentTarget.play();
              } catch (err) {
                console.error("Error playing video 2 on load:", err);
              }
            }}
          ></video>
        </div>
        <div className="w-1/2 p-2">
          <video 
            ref={videoRef3} 
            className="w-full h-full object-cover rounded-lg" 
            autoPlay 
            playsInline
            onLoadedMetadata={async (e) => {
              try {
                await e.currentTarget.play();
              } catch (err) {
                console.error("Error playing video 3 on load:", err);
              }
            }}
          ></video>
        </div>
      </div>
      {!status ? (
        <div
          className="hover:cursor-pointer w-full text-center hover:bg-slate-800 py-1 self-center text-white bg-slate-600"
          onClick={handleStartCall}
        >
          Start Call
        </div>
      ) : status && !isJoined ? (
        <div onClick={handleStartCall} className="hover:cursor-pointer w-full text-center self-center hover:bg-red-800 py-1 text-white bg-red-600">
          Join Call
        </div>
      ) : (
        <div onClick={handleEndCall} className="hover:cursor-pointer self-center w-full text-center hover:bg-red-800 py-1 text-white bg-red-600">
          End Call
        </div>
      )}
    </div>
  );
}