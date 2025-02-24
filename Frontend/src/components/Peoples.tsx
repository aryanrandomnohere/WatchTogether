import { IoArrowBackCircleSharp } from "react-icons/io5"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { chatType } from "../State/chatWindowState"
import { people } from "../State/roomPeopleState"
import getSocket from "../services/getSocket"
import { useParams } from "react-router-dom"
import { userInfo } from "../State/userState"
import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import { joinedStatus } from "../State/isJoined"
import CallNotification from "./CallNotification"

enum ChatType {
    CHATS,
    POLL,
    VOTES,
}

const socket = getSocket()
export default function Peoples() {
    const setChatType = useSetRecoilState(chatType)
    const members = useRecoilValue(people)
    const Info = useRecoilValue(userInfo)
    const videoref = useRef<HTMLVideoElement>(null)
    const videoRef2 = useRef<HTMLVideoElement>(null)
    const localVideoRef =  useRef<HTMLVideoElement>(null)
    const pc = useRef<RTCPeerConnection | null>(null)
    const pc2 = useRef<RTCPeerConnection | null>(null)
    const {roomId} = useParams()
    const storedOffer = useRef<RTCSessionDescriptionInit | null>(null)
    const [isReceiver,setIsReceiver] = useState<null | boolean>(null)
    const [isJoined,setIsJoined] = useRecoilState(joinedStatus)
    async function Join(msg:string){
    toast.custom((t) => (
      <CallNotification msg={msg} isJoined={isJoined} setIsJoined={setIsJoined} t={t} />
      ))
    }
    useEffect(() => {
        async function sendAnswer() {
            if (!pc2.current) {
                pc2.current = new RTCPeerConnection();
            }
    
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (!stream) return;
    
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                    await localVideoRef.current.play().catch(err => console.error("Error playing local video:", err));
                }
    
                pc2.current.addTrack(stream.getVideoTracks()[0]);
    
                pc2.current.ontrack = (event) => {
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
    
                pc2.current.onnegotiationneeded = async () => {
                    if (!pc2.current || !storedOffer.current) return;
                    if (storedOffer.current == null) return
                    await pc2.current.setRemoteDescription(new RTCSessionDescription(storedOffer.current));
                    const answer = await pc2.current.createAnswer();
                    await pc2.current.setLocalDescription(answer);
                    setIsReceiver(true);
    
                    pc2.current.onicecandidate = (event) => {
                        if (event.candidate) {
                            socket.emit("ice-candidate", { userId: Info.id, candidate: event.candidate });
                        }
                    };
    
                    socket.emit("answer-created", roomId, Info.id, answer);
                };
            } catch (error) {
                console.error("Error accessing media devices:", error);
            }
        }
    
        if (isJoined && storedOffer.current) {
            sendAnswer();
        }
    }, [isJoined, storedOffer.current, socket]); // Added correct dependencies

    useEffect(()=>{
            socket.on("multiple-call-error",async (msg:string)=>{
                toast.error(msg);
            })
            socket.on("initiate-offer",async (msg:string,sdp:RTCSessionDescription)=>{
           await Join(msg)
           storedOffer.current = sdp
            })
            socket.on("answer-created",(msg:string,sdp:any)=>{
                toast.success(msg);
                console.log(`${sdp} receiver created answer`);
                if(pc.current){
                pc.current.setRemoteDescription(sdp)
            }
            })
            socket.on("receiver-ice-candidate", async (candidate: any) => {
                if (pc2.current) {
                    try {
                        await pc2.current.addIceCandidate(new RTCIceCandidate(candidate)); // ✅ Ensure proper ICE candidate format
                    } catch (error) {
                        console.error("Error adding ICE candidate:", error);
                    }
                }
            });
            socket.on("sender-ice-candidate", async (candidate: any) => {
                if (pc.current) {
                    try {
                        await pc.current.addIceCandidate(new RTCIceCandidate(candidate)); // ✅ Same fix for sender
                    } catch (error) {
                        console.error("Error adding ICE candidate:", error);
                    }
                }
            });
            
        return ()=>{
            socket.off("answer-created")
            socket.off("multiple-call-error")
            socket.off("initiate-offer")
            socket.off("receiver-ice-candidate")
            socket.off("sender-ice-candidate")

        }
    },[pc,pc2]);

    const handleCall = async  ()=>{

        if (!pc.current) {
            pc.current = new RTCPeerConnection();
        }
        
        pc.current.onicecandidate = (event)=>{
            console.log(event);
             if(event.candidate){
                socket.emit("ice-candidate",{userId:Info.id,candidate:event.candidate})
                }  
            } 
        const stream = await navigator.mediaDevices.getUserMedia({video:true,audio:true}); 
        if (!stream) return;
        pc.current.addTrack(stream.getVideoTracks()[0])
        if(!pc.current){
            console.log(pc," does not exists");
            return
        } 
        pc.current.ontrack = (event) => {
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
       pc.current.onnegotiationneeded = async () =>{ 
        if(!pc.current) return
        console.log("On negotiation needed");
        const offer = await pc.current.createOffer();
        await pc.current.setLocalDescription(offer);
        const membersId = members?.map((mem)=>mem.userId)
        console.log("initiating offer");
        socket.emit("initiate-offer",roomId,{id:Info.id, username:Info.username, displayname:Info.displayname},membersId,offer) 
    }
    setIsReceiver(false) 
    }
    function goBack() {
        setChatType(ChatType.CHATS)
      }
  return (
     <div className=" flex flex-col  w-full h-64 md:h-[40.5rem] border border-t-0 border-white/15 " >
            <div className="mx-3 mb-5 hover:cursor-pointer max-w-72" onClick={goBack}><IoArrowBackCircleSharp className="text-3xl hover:text-slate-400" /></div>
           <div className="flex justify-between mx-3 h-full"> {members && members.map((p)=><div key={p.userId} className=" w-1/2 border text-center h-fit">{p.displayname}</div>)}</div>
           <div className="flex flex-wrap w-full h-full ">
           <video ref={localVideoRef} className="w-1/2" src="" autoPlay playsInline></video>

            <video ref={videoref} src="" className="w-1/2" autoPlay playsInline></video>
           
          <video ref={videoRef2 } src="" className="w-1/2" autoPlay playsInline></video>
          </div>
          { isReceiver == null ? <div  className="hover:cursor-pointer w-full text-center hover:bg-slate-800 py-1 self-center text-white bg-slate-600 " onClick={handleCall}>Start Call</div>: isReceiver ? <div className="hover:cursor-pointer w-full text-center self-center hover:bg-red-800 py-1 text-white bg-red-600 ">Leave</div>:<div className="hover:cursor-pointer self-center  w-full text-center hover:bg-red-800 py-1 text-white  bg-red-600">End Call</div>}
          
          </div>
  )
}
