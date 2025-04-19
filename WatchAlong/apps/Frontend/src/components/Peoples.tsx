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
  const videoref = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const p2pConnections = useRef<P2pInstanceType[]>([]);
  const { roomId } = useParams();
  const [isJoined, setIsJoined] = useRecoilState(joinedStatus);
  const [status, setStatus] = useState<boolean | null>(null);
  const callStatus = async () =>{
    const response = await axios.get(
      //@ts-expect-error dfd
      `${import.meta.env.VITE_BACKEND_APP_API_BASE_URL}/api/v1/room/call/${roomId}`,
      {
        headers: {
          authorization: localStorage.getItem('token'),
        }
      })
      if(response.data.callCount.length > 0){
        return true;
      }
      return false;
  }
  callStatus().then((response)=>{setStatus(response)})
  async function JoinNotification(msg: string) {
    toast.custom(t => (
      <CallNotification msg={msg} isJoined={isJoined} setIsJoined={setIsJoined} t={t} />
    ));
  }
const sendIceCandidate = ({userId,to,candidate}:{userId:string,to:string,candidate:RTCIceCandidate})=>{
  socket.emit("ice-candidate",{userId,to,candidate})
  return;
}
const setIceCandidate = ({from,candidate}:{from:string,candidate:RTCIceCandidate})=>{
  const index = p2pConnections.current.findIndex((conn)=>conn.withUserId === from);
  if(!p2pConnections.current[index]) return;
  p2pConnections.current[index].instance.addIceCandidate(candidate);
  return;
}
const createConnection = async  ({to}:{to:string | null})=>{
    p2pConnections.current.push({
      withUserId: to,
      instance: new RTCPeerConnection(),
    })
    const index = p2pConnections.current.length-1;
    if (!p2pConnections.current[index]) {
       return;
    }
    p2pConnections.current[index].instance.onicecandidate = (event)=>{
        console.log(event);
         if(event.candidate){
          if(!to) return;
            sendIceCandidate({userId:Info.id,to:to,candidate:event.candidate})
            }
        }
    const stream = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
    if (!stream) return;
    p2pConnections.current[index].instance.addTrack(stream.getVideoTracks()[0])
    if(!p2pConnections.current[index]){
        console.log(p2pConnections.current[index]," does not exists");
        return
    }
    p2pConnections.current[index].instance.ontrack = (event) => {
        console.log("Received track:", event.track);

        if (!videoRef2.current) return;

        let stream = videoRef2.current.srcObject as MediaStream;
        if (!stream) {
            stream = new MediaStream();
            videoRef2.current.srcObject = stream;
        }
        if(localVideoRef.current){
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.play().catch(err => console.error("Error playing local video:", err));
        }
        if (!stream.getTracks().some(t => t.id === event.track.id)) {
            stream.addTrack(event.track);
        }

        videoRef2.current.play().catch(err => console.error("Autoplay error:", err));
    };

    // Create and set local description immediately
    const offer = await p2pConnections.current[index].instance.createOffer();
    await p2pConnections.current[index].instance.setLocalDescription(offer);
    return offer;
}



async function CreateAnswer(sdp:RTCSessionDescriptionInit,from:string){
  const index = p2pConnections.current.findIndex((conn)=>conn.withUserId === from);
  p2pConnections.current.push({
    withUserId: from,
    instance: new RTCPeerConnection(),
  })
  const pc2 = p2pConnections.current[index].instance;
  try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (!stream) return;

      if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          await localVideoRef.current.play().catch(err => console.error("Error playing local video:", err));
      }

      pc2.addTrack(stream.getVideoTracks()[0]);

      pc2.ontrack = (event) => {
          console.log("Received track:", event.track);

          if (!videoref.current) return;

          let existingStream = videoref.current.srcObject as MediaStream;
          if (!existingStream) {
              existingStream = new MediaStream();
              videoref.current.srcObject = existingStream;
          }

          if (!existingStream.getTracks().some(t => t.id === event.track.id)) {
              existingStream.addTrack(event.track);
          }

          videoref.current.play().catch(err => console.error("Autoplay error:", err));
      };

      pc2.onnegotiationneeded = async () => {
          await pc2.setRemoteDescription(new RTCSessionDescription(sdp));
          const answer = await pc2.createAnswer();
          await pc2.setLocalDescription(answer);

          pc2.onicecandidate = (event) => {
              if (event.candidate) {
                    sendIceCandidate({userId:Info.id,to:from,candidate:event.candidate})
                }
          };
          return answer;
}}catch(error){
  console.error("Error Generating answer", error);
}
return
}
 
  function goBack() {
    setChatType(ChatType.CHATS);
  }
  async function handleJoin() {
    const response = await axios.get(
      //@ts-expect-error dfd
      `${import.meta.env.VITE_BACKEND_APP_API_BASE_URL}/api/v1/room/call/${roomId}`,
      {
        headers: {
          authorization: localStorage.getItem('token'),
        },
      }
    );
    const inCallUsers: string[] = response.data;

    console.log(inCallUsers,"inCallUsers");
    if (inCallUsers.length < 1){
        const offer = await createConnection({ to: null});
        if (offer) {
            console.log("Emitting initiate-offer with offer:", offer);
            socket.emit("initiate-offer",roomId,{id:Info.id, username:Info.username, displayname:Info.displayname},null,offer);
        }
        return;   
    }
    for(const inCall of inCallUsers){
        const offer = await createConnection({ to: inCall});
        if (offer) {
            console.log("Emitting initiate-offer with offer for user:", inCall, offer);
            socket.emit("initiate-offer",roomId,{id:Info.id, username:Info.username, displayname:Info.displayname},inCall,offer);
        }
    }
    return;
  }

  useEffect(()=>{
    socket.on("ice-candidate",setIceCandidate);
    socket.on("initiate-offer",(msg:string,sdp:RTCSessionDescriptionInit,from:string)=>{
      JoinNotification(msg);
      const answer = CreateAnswer(sdp,from);
      if(answer){
        socket.emit("answer-created",roomId,Info.id,from,answer);
        console.log("Answer created",answer);
        return;
      }
      console.log("Answer not created");
      return;
    })  
    return ()=>{
      socket.off("ice-candidate",setIceCandidate);
      socket.off("initiate-offer")
    }
  },[isJoined])
  return (
    <div className=" flex flex-col  w-full h-64 md:h-[40.5rem] border border-t-0 border-white/15 ">
      <div className="mx-3 mb-5 hover:cursor-pointer max-w-72" onClick={goBack}>
        <IoArrowBackCircleSharp className="text-3xl hover:text-slate-400" />
      </div>
      <div className="flex justify-between mx-3 h-full">
        {' '}
        {members &&
          members.map(p => (
            <div key={p.userId} className=" w-1/2 border text-center h-fit">
              {p.displayname}
            </div>
          ))}
      </div>
      <div className="flex flex-wrap w-full h-full ">
        <video ref={localVideoRef} className="w-1/2" src="" autoPlay playsInline></video>

        <video ref={videoref} src="" className="w-1/2" autoPlay playsInline></video>

        <video ref={videoRef2} src="" className="w-1/2" autoPlay playsInline></video>
      </div>
      {status == null ? (
        <div
          className="hover:cursor-pointer w-full text-center hover:bg-slate-800 py-1 self-center text-white bg-slate-600 "
          onClick={handleJoin}
        >
          Start Call
        </div>
      ) : status ? (
        <div className="hover:cursor-pointer w-full text-center self-center hover:bg-red-800 py-1 text-white bg-red-600 ">
          Leave
        </div>
      ) : (
        <div className="hover:cursor-pointer self-center  w-full text-center hover:bg-red-800 py-1 text-white  bg-red-600">
          End Call
        </div>
      )}
    </div>
  );
}

