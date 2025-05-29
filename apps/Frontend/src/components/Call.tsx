import { useEffect, useRef, useState } from "react";
import { IoCallOutline } from "react-icons/io5";
import { SlCallEnd } from "react-icons/sl";
import getSocket from "../services/getSocket";
import { useRecoilState, useRecoilValue } from "recoil";
import { joinedStatus } from "../State/isJoined";
import { userInfo } from "../State/userState";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import MovableVideoPanel from "./MovableVideoPanel";

interface P2pInstanceType {
    withUserId: string | null;
    instance: RTCPeerConnection;
    remoteStream: MediaStream | null;
  }

export default function Call() {
  const [showVideo ,setShowVideo] = useState(false);
  const [status, setStatus] = useState<boolean | null>(null);
  const [isJoined, setIsJoined] = useRecoilState(joinedStatus);
  const Info = useRecoilValue(userInfo);
  const p2pConnections = useRef<P2pInstanceType[]>([]);
  let ownStream: MediaStream | null = null;
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);
  const videoRef3 = useRef<HTMLVideoElement>(null);
  const {roomId} = useParams()
  const [cameraStatus, setCameraStatus] = useState(true);
  const [micStatus,setMicStatus] = useState(true)
  const [reRender, setReRender] = useState(0);

  function handleMicToggle() {
    try {
      // Get the current stream from the local video element as backup
      const currentStream = ownStream || (localVideoRef.current?.srcObject as MediaStream);
      
      if (!currentStream) {
        console.error("No stream available for mic toggle");
        return;
      }
  
      const audioTracks = currentStream.getAudioTracks();
      
      if (audioTracks && audioTracks.length > 0) {
        console.log("Mic Toggle Called");
        const newEnabledState = !audioTracks[0].enabled;
        audioTracks[0].enabled = newEnabledState;
        setMicStatus(newEnabledState);
        
        console.log(`Microphone ${newEnabledState ? 'enabled' : 'disabled'}`);
      } else {
        console.error("No audio tracks found");
      }
    } catch (error) {
      console.error("Error toggling microphone:", error);
    }
  }
  
  function handleVideoToggle() {
    try {
      // Get the current stream from the local video element as backup
      const currentStream = ownStream || (localVideoRef.current?.srcObject as MediaStream);
      
      if (!currentStream) {
        console.error("No stream available for video toggle");
        return;
      }
  
      const videoTracks = currentStream.getVideoTracks();
      
      if (videoTracks && videoTracks.length > 0) {
        console.log("Video toggle called");
        const newEnabledState = !videoTracks[0].enabled;
        videoTracks[0].enabled = newEnabledState;
        setCameraStatus(newEnabledState);
        
        console.log(`Camera ${newEnabledState ? 'enabled' : 'disabled'}`);
      } else {
        console.error("No video tracks found");
      }
    } catch (error) {
      console.error("Error toggling camera:", error);
    }
  }


  async function handleEndCall() {
    try {

      // Stop own stream if it exists
      if (ownStream) {
        ownStream.getTracks().forEach(track => track.stop());
        ownStream = null;
      }
  
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
      getSocket().emit('leave-call', roomId, localStorage.getItem('userId'));
      setIsJoined(false);
    } catch (error) {
      console.error('Error ending call:', error);
    }
  }

  useEffect(() => {
    console.log('Setting up socket event listeners');
    getSocket().on("leave-call", (userId:string)=>{
        console.log(userId, "Left the call")
       const index =  p2pConnections.current.findIndex((conn)=> conn.withUserId === userId)
       p2pConnections.current[index].instance.close();
        const ref = getVideoRef(index);
        // if(ref?.current) ref?.current.srcObject = null;
    })

    getSocket().on("join-call-success", () => {
      toast.success("Joined call successfully");
    });
    getSocket().on("join-call-error", () => {
      toast.error("Failed to join call");
    });
    // Handle ICE candidates from other peers
    getSocket().on('ice-candidate', data => {
      console.log('Received ICE candidate from:', data.from);
      setIceCandidate({from:data.from, candidate:data.candidate});
    });

    // Handle answers to our offers
    getSocket().on('answer-created', (from: string, answer: RTCSessionDescriptionInit) => {
      if(from === localStorage.getItem('userId')){
        console.log("Received answer from self , ignoring will sort out later");
        return;
    }
      console.log('Received answer from:', from);
      
      let index = p2pConnections.current.findIndex(conn => conn.withUserId === from);
      if(index === -1 && p2pConnections.current.length === 1){
        index = 0;
        console.log("Setting withUserId to:", from);
        p2pConnections.current[0].withUserId = from;
      }
      if (index === -1  ) {
        console.error('Cannot find connection for user:', from);
        return;
      }
      const peerConnection = p2pConnections.current[index].instance;

      console.log("Setting remote description", answer , "to:", peerConnection);
      peerConnection
        .setRemoteDescription(answer)
        .then(() => {
          console.log('Successfully set remote description (answer)');
        })
        .catch(err => {
          console.error('Error setting remote description (answer):', err);
        });


        setTimeout(()=>{
            setReRender(reRender+1)
          } ,500)
     
    });
   
    // Handle call status updates
    getSocket().on('call-status', (callStatus: boolean) => {
      console.log('Call status updated:', callStatus);
      setStatus(callStatus);
    });

    // Handle incoming offers
    getSocket().on(
      'initiate-offer',
      async (msg: string, sdp: RTCSessionDescriptionInit, from: string) => {
        console.log('Received offer from:', from);
         await CreateAnswer(sdp, from);
      }
    );

    // Cleanup function to remove all listeners
    return () => {
      console.log('Cleaning up socket event listeners');
      getSocket().off('ice-candidate');
      getSocket().off('answer-created');
      getSocket().off('call-status');
      getSocket().off('initiate-offer');
      getSocket().off('join-call-success');
      getSocket().off('join-call-error');
      handleEndCall()
      // Close and clean up any existing peer connections
      p2pConnections.current.forEach(conn => {
        conn.instance.close();
      });
      p2pConnections.current = [];
      if (ownStream) {
        ownStream.getTracks().forEach(track => track.stop());
        ownStream = null;
      }
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Empty dependency array to run once on component mount


  const sendIceCandidate = ({
    userId,
    to,
    candidate,
  }: {
    userId: string;
    to: string;
    candidate: RTCIceCandidate;
  }) => {
    console.log('Sending ICE candidate to:', to);
    if(userId == to) return
    getSocket().emit('ice-candidate', { userId, to, candidate });
    return;
  };

  const setIceCandidate = ({ from, candidate }: { from: string; candidate: RTCIceCandidate }) => {
    console.log('Received ICE candidate from:', from,"my id:", localStorage.getItem('userId') );
    
    if(from === localStorage.getItem('userId')){
      console.log("Received ICE candidate from self , ignoring and will sort out later");
      return;
    }
    const index = p2pConnections.current.findIndex(conn => conn.withUserId === from);
    if (index === -1) {
      console.error('Cannot find connection for ICE candidate from:', from);
      console.log(p2pConnections.current);
      return;
    }
    p2pConnections.current[index].instance
      .addIceCandidate(candidate)
      .then(() => console.log('Successfully added ICE candidate'))
      .catch(err => console.error('Error adding ICE candidate:', err));
    return;
  };

  const getVideoRef = (index: number) => {
    switch (index) {
      case 0:
        return videoRef1;
      case 1:
        return videoRef2;
      case 2:
        return videoRef3;
      default:
        return null;
    }
  };


  const getCameraStreamAndSend = async (pc: RTCPeerConnection) => {
    try{  if(ownStream && ownStream.getTracks().length > 0 ){
      console.log("using existing stream");
        ownStream.getTracks().forEach((track) => {
           pc.addTrack(track, ownStream as MediaStream);
        });
        return ownStream;
      }
       console.log("Getting new stream"); 
      const stream = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
      if(!localVideoRef?.current || stream.getTracks().length == 0) return null;
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.play();
      ownStream = stream;
      stream.getTracks().forEach((track)=>{
        pc.addTrack(track,stream);
      })
      return stream;
    } catch (error) {
      console.error("Erro getting media stream:", error);
      return null;
    }
  }


  async function createConnection({ to }: { to: string | null }) {
    if(to === Info.id) return
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    p2pConnections.current.push({
      withUserId: to,
      instance: peerConnection,
      remoteStream:null,
    });
    console.log(p2pConnections.current);

    const index = p2pConnections.current.length - 1;
    console.log("Index:", index);
    const videoRef = getVideoRef(index);

    if (!videoRef?.current) return null;

    try {
      // Set up ICE candidate handling
      peerConnection.onicecandidate = event => {
        if (event.candidate) {
          sendIceCandidate({ userId: localStorage.getItem('userId') || Info.id, to: to || '', candidate: event.candidate });
        }
      };
     
      // Handle incoming tracks
      const withUserId = p2pConnections.current[index].withUserId;
      // Connection state monitoring
      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state change:', peerConnection.connectionState, 'with peer:', withUserId);
      };

      peerConnection.oniceconnectionstatechange = function() {
        if(peerConnection.iceConnectionState == 'disconnected') {
            console.log('Disconnected');
            
        }
    }
      // Get local stream
      peerConnection.ontrack = async event => {
        if (!videoRef?.current) {
          console.log("No video ref");
          return;
        }
        if(!p2pConnections.current[index].remoteStream){
            p2pConnections.current[index].remoteStream = new MediaStream()
        }
        p2pConnections.current[index].remoteStream?.addTrack(event.track)
        console.log( p2pConnections.current[index].remoteStream)
        videoRef.current.srcObject =   p2pConnections.current[index].remoteStream;
        try {
          await videoRef.current.play();
          console.log('Remote video playing successfully');
        } catch (err) {
          console.error('Error playing remote video:', err);
        }
      };

      // Create the offer
      console.log('Creating offer');
      await getCameraStreamAndSend(peerConnection);
      const offer = await peerConnection.createOffer();
      console.log('Setting local description (offer)');
      await peerConnection.setLocalDescription(offer);
      if (peerConnection.localDescription) {
        console.log('Sending offer to user:', to);
        getSocket().emit(
          'initiate-offer',
          roomId,
          {
            id:  localStorage.getItem('userId'),
            username: Info.username,
            displayname: Info.displayname,
          },
          to,
          peerConnection.localDescription
        );

      }
    } catch (error) {
      console.error('Error in create_Connection:', error);
      return null;
    }
  }


  async function CreateAnswer(sdp: RTCSessionDescriptionInit, from: string) {
    // Create peer connection with STUN servers
    console.log("Creating answer");
    if(from === Info.id){
      console.log("Received answer from self");
      return
    }
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });
    
    p2pConnections.current.push({
      withUserId: from,
      instance: peerConnection,
      remoteStream:null,
    });

    const index = p2pConnections.current.findIndex(conn => conn.withUserId === from);
    const videoRef = getVideoRef(index);

    if (!videoRef?.current) {
      console.log("No video ref");
      return null;
    }

    try {
      // Set up ICE candidate handler first
      peerConnection.onicecandidate = event => {
        if (event.candidate) {
          console.log('Sending ICE candidate to:', from);
          if(from == Info.id || localStorage.getItem("userId")) {
            console.log("Sending answer to self will sort out later")
            return;
          }
          sendIceCandidate({ userId: localStorage.getItem('userId')|| Info.id, to: from, candidate: event.candidate });
        }
      };

      // Connection state monitoring
      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state change:', peerConnection.connectionState, 'with peer:', from);
      };

      peerConnection.oniceconnectionstatechange = () => {
        console.log(
          'ICE connection state change:',
          peerConnection.iceConnectionState,
          'with peer:',
          from
        );
      };

      // Handle incoming remote tracks
      peerConnection.ontrack = async event => {
        if (!videoRef?.current) {
          console.log("No video ref");
          return;
        }
        if(!p2pConnections.current[index].remoteStream){
            p2pConnections.current[index].remoteStream = new MediaStream()
        }
        p2pConnections.current[index].remoteStream.addTrack(event.track)
        console.log( p2pConnections.current[index].remoteStream)
        videoRef.current.srcObject =   p2pConnections.current[index].remoteStream;
        try {
          await videoRef.current.play();
          console.log('Remote video playing successfully');
        } catch (err) {
          console.error('Error playing remote video:', err);
        }
      };

      // Process the remote offer first
      console.log('Setting remote description (offer)');
      await peerConnection.setRemoteDescription(sdp);
      await getCameraStreamAndSend(peerConnection);
      console.log('Creating answer');
      const answer = await peerConnection.createAnswer();
      console.log('Setting local description (answer)');
      await peerConnection.setLocalDescription(answer);
      if (answer) {
        console.log('Sending answer to initial caller');
        getSocket().emit('answer-created', roomId, localStorage.getItem('userId'), from, peerConnection.localDescription);
        setIsJoined(true);
      } else {
        console.error('Failed to create answer');
      }
      setTimeout(()=>{
        setReRender(reRender+1)
      } ,500)
    } catch (error) {
      console.error('Error in Create_Answer:', error);
      return null;
    }
  }



  async function handleStartCall() {
    try {
      // Get current call status from server
      const response = await axios.get(
        //@ts-expect-error TODO: change to use the backend api
        `${import.meta.env.VITE_BACKEND_APP_API_BASE_URL}/api/v1/room/call/${roomId}`,
        {
          headers: {
            authorization: localStorage.getItem('token'),
          },
        }
      );

      const { callCount } = response.data;

      // Case 1: Joining an existing call with 0 people
      if (callCount.length === 0) {
        getSocket().emit('join-call', roomId, localStorage.getItem('userId'));
        setIsJoined(true);
        return;
      }

    
      
      // Case 2: Joining a call with multiple people
      console.log('Joining call with multiple people:', callCount);
      for (const userId of callCount) {
        if(userId === localStorage.getItem('userId')){
          console.log("Skipping self");
          continue;
        }
        console.log('Creating connection with user:', userId);
        await createConnection({ to: userId });
      }
      setIsJoined(true);
    } catch (error) {
      console.error('Error in handleStartCall:', error);
    }
  }


  return (
    <div>
    <div
    onClick={()=>setShowVideo(!showVideo)}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 hover:cursor-pointer ${
      showVideo
        ? 'bg-red-700/80 text-white'
        : 'text-slate-300 hover:bg-slate-700/50'
    }`}
  >
{ !showVideo ? <div className='flex gap-2'
onClick = {handleStartCall}
><IoCallOutline size={20} 
    // onClick={handleStartCall}
    /> {!status?"Start Call": "Join Call"}</div>: <div onClick={handleEndCall} className='flex gap-2 px-[8.5px] items-center' ><SlCallEnd size={18} />End Call</div>}
     </div>
     <MovableVideoPanel handleMicToggle={handleMicToggle} handleVideoToggle={handleVideoToggle} cameraStatus={cameraStatus} micStatus={micStatus} localVideoRef={localVideoRef} videoRef1={videoRef1} videoRef2={videoRef2} videoRef3={videoRef3}/> 
    {/* <div className="bottom-0 left-0 w-full h-full">
     <div className="flex flex-wrap w-full h-full">
        <div className="w-1/2 p-2">
            <video ref={localVideoRef} autoPlay playsInline muted/>
        </div>
        <div className="w-1/2 p-2">
            <video ref={videoRef1} autoPlay playsInline/>
        </div>
        <div className="w-1/2 p-2">
            <video ref={videoRef2} autoPlay playsInline/>
        </div>
        <div className="w-1/2 p-2">
            <video ref={videoRef3} autoPlay playsInline/>
        </div>
    </div>
    </div> */}
     </div>
     )
    }
