
import React from 'react'

export default function Peoples() {
  return (
    <div>Peoples</div>
  )
}

// import { useEffect, useRef, useState } from 'react';
// import toast from 'react-hot-toast';
// import { IoArrowBackCircleSharp } from 'react-icons/io5';
// import { useParams } from 'react-router-dom';
// import axios from 'axios';
// import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
// import { chatType } from '../State/chatWindowState';
// import { joinedStatus } from '../State/isJoined';
// import { people } from '../State/roomPeopleState';
// import { userInfo } from '../State/userState';
// import getSocket from '../services/getSocket';
// import CallNotification from './CallNotification';

// enum ChatType {
//   CHATS,
//   POLL,
//   VOTES,
// }
// interface P2pInstanceType {
//   withUserId: string | null;
//   instance: RTCPeerConnection;
// }

// const socket = getSocket();
// let ownStream: MediaStream | null = null;
// export default function Peoples() {
//   const setChatType = useSetRecoilState(chatType);
//   const members = useRecoilValue(people);
//   const Info = useRecoilValue(userInfo);
//   const localVideoRef = useRef<HTMLVideoElement>(null);
//   const videoRef1 = useRef<HTMLVideoElement>(null);
//   const videoRef2 = useRef<HTMLVideoElement>(null);
//   const videoRef3 = useRef<HTMLVideoElement>(null);
//   const p2pConnections = useRef<P2pInstanceType[]>([]);
//   const { roomId } = useParams();
//   const [isJoined, setIsJoined] = useRecoilState(joinedStatus);
//   const [status, setStatus] = useState<boolean | null>(null);

//   async function JoinNotification(msg: string) {
//     toast.custom(t => (
//       <CallNotification msg={msg} isJoined={isJoined} setIsJoined={setIsJoined} t={t} />
//     ));
//   }

//   const sendIceCandidate = ({
//     userId,
//     to,
//     candidate,
//   }: {
//     userId: string;
//     to: string;
//     candidate: RTCIceCandidate;
//   }) => {
//     console.log('Sending ICE candidate to:', to);
//     socket.emit('ice-candidate', { userId, to, candidate });
//     return;
//   };

//   const setIceCandidate = ({ from, candidate }: { from: string; candidate: RTCIceCandidate }) => {
//     console.log('Received ICE candidate from:', from,"my id:", localStorage.getItem('userId') );
    
//     if(from === localStorage.getItem('userId')){
//       console.log("Received ICE candidate from self , ignoring and will sort out later");
//       return;
//     }
//     const index = p2pConnections.current.findIndex(conn => conn.withUserId === from);
//     if (index === -1) {
//       console.error('Cannot find connection for ICE candidate from:', from);
//       console.log(p2pConnections.current);
//       return;
//     }
//     p2pConnections.current[index].instance
//       .addIceCandidate(candidate)
//       .then(() => console.log('Successfully added ICE candidate'))
//       .catch(err => console.error('Error adding ICE candidate:', err));
//     return;
//   };

//   const getVideoRef = (index: number) => {
//     switch (index) {
//       case 0:
//         return videoRef1;
//       case 1:
//         return videoRef2;
//       case 2:
//         return videoRef3;
//       default:
//         return null;
//     }
//   };
//   const getCameraStreamAndSend = async (pc: RTCPeerConnection) => {
//     try{  if(ownStream && ownStream.getTracks().length > 0 ){
//       console.log("using existing stream");
//         ownStream.getTracks().forEach((track) => {
//            pc.addTrack(track, ownStream);
//         });
//         return ownStream;
//       }
//        console.log("Getting new stream");
//       const stream = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
//       if(!localVideoRef?.current || stream.getTracks().length == 0) return null;
//       localVideoRef.current.srcObject = stream;
//       localVideoRef.current.play();
//       ownStream = stream;
//       stream.getTracks().forEach((track)=>{
//         pc.addTrack(track,stream);
//       })
//       return stream;
//     } catch (error) {
//       console.error("Erro getting media stream:", error);
//       return null;
//     }
//   }

//   async function createConnection({ to }: { to: string | null }) {
//     const peerConnection = new RTCPeerConnection({
//       iceServers: [
//         { urls: 'stun:stun.l.google.com:19302' },
//         { urls: 'stun:stun1.l.google.com:19302' },
//       ],
//     });

//     p2pConnections.current.push({
//       withUserId: to,
//       instance: peerConnection,
//     });
//     console.log(p2pConnections.current);

//     const index = p2pConnections.current.length - 1;
//     console.log("Index:", index);
//     const videoRef = getVideoRef(index);

//     if (!videoRef?.current) return null;

//     try {
//       // Set up ICE candidate handling
//       peerConnection.onicecandidate = event => {
//         if (event.candidate) {
//           sendIceCandidate({ userId: localStorage.getItem('userId'), to: to || '', candidate: event.candidate });
//         }
//       };
     
//       // Handle incoming tracks
//       const withUserId = p2pConnections.current[index].withUserId;
//       // Connection state monitoring
//       peerConnection.onconnectionstatechange = () => {
//         console.log('Connection state change:', peerConnection.connectionState, 'with peer:', withUserId);
//       };

//       peerConnection.oniceconnectionstatechange = () => {
//         console.log(
//           'ICE connection state change:',
//           peerConnection.iceConnectionState,
//           'with peer:',
//           withUserId
//         );
//       };
//       // Get local stream
//       peerConnection.ontrack = async event => {
//         if (!videoRef?.current) {
//           console.log("No video ref");
//           return;
//         }
//         console.log("Remote video playing successfully");
//         videoRef.current.srcObject = new MediaStream([event.track]);
//         try {
//           await videoRef.current.play();
//           console.log('Remote video playing successfully');
//         } catch (err) {
//           console.error('Error playing remote video:', err);
//         }
//       };

//       // Create the offer
//       console.log('Creating offer');
//       await getCameraStreamAndSend(peerConnection);
//       const offer = await peerConnection.createOffer();
//       console.log('Setting local description (offer)');
//       await peerConnection.setLocalDescription(offer);
//       if (peerConnection.localDescription) {
//         console.log('Sending offer to user:', to);
//         socket.emit(
//           'initiate-offer',
//           roomId,
//           {
//             id:  localStorage.getItem('userId'),
//             username: Info.username,
//             displayname: Info.displayname,
//           },
//           to,
//           peerConnection.localDescription
//         );
//       }
//     } catch (error) {
//       console.error('Error in create_Connection:', error);
//       return null;
//     }
//   }

//   async function CreateAnswer(sdp: RTCSessionDescriptionInit, from: string) {
//     // Create peer connection with STUN servers
//     console.log("Creating answer");
//     const peerConnection = new RTCPeerConnection({
//       iceServers: [
//         { urls: 'stun:stun.l.google.com:19302' },
//         { urls: 'stun:stun1.l.google.com:19302' },
//       ],
//     });

//     p2pConnections.current.push({
//       withUserId: from,
//       instance: peerConnection,
//     });

//     const index = p2pConnections.current.findIndex(conn => conn.withUserId === from);
//     const videoRef = getVideoRef(index);

//     if (!videoRef?.current) {
//       console.log("No video ref");
//       return null;
//     }

//     try {
//       // Set up ICE candidate handler first
//       peerConnection.onicecandidate = event => {
//         if (event.candidate) {
//           console.log('Sending ICE candidate to:', from);
//           sendIceCandidate({ userId: localStorage.getItem('userId'), to: from, candidate: event.candidate });
//         }
//       };

//       // Connection state monitoring
//       peerConnection.onconnectionstatechange = () => {
//         console.log('Connection state change:', peerConnection.connectionState, 'with peer:', from);
//       };

//       peerConnection.oniceconnectionstatechange = () => {
//         console.log(
//           'ICE connection state change:',
//           peerConnection.iceConnectionState,
//           'with peer:',
//           from
//         );
//       };

//       // Handle incoming remote tracks
//       peerConnection.ontrack = async event => {
//         if (!videoRef?.current) {
//           console.log("No video ref");
//           return;
//         }
//         videoRef.current.srcObject = new MediaStream([event.track]);
//         console.log("Remote video playing successfully");
//         try {
//           await videoRef.current.play();
//           console.log('Remote video playing successfully');
//         } catch (err) {
//           console.error('Error playing remote video:', err);
//         }
//       };

//       // Process the remote offer first
//       console.log('Setting remote description (offer)');
//       await peerConnection.setRemoteDescription(sdp);
//       await getCameraStreamAndSend(peerConnection);
//       console.log('Creating answer');
//       const answer = await peerConnection.createAnswer();
//       console.log('Setting local description (answer)');
//       await peerConnection.setLocalDescription(answer);
//       console.log(answer);
//       if (answer) {
//         console.log('Sending answer to initial caller');
//         socket.emit('answer-created', roomId, localStorage.getItem('userId'), from, peerConnection.localDescription);
//         setIsJoined(true);
//       } else {
//         console.error('Failed to create answer');
//       }

//     } catch (error) {
//       console.error('Error in Create_Answer:', error);
//       return null;
//     }
//   }

//   function goBack() {
//     setChatType(ChatType.CHATS);
//   }

//   async function handleStartCall() {
//     try {
//       // Get current call status from server
//       const response = await axios.get(
//         //@ts-expect-error TODO: change to use the backend api
//         `${import.meta.env.VITE_BACKEND_APP_API_BASE_URL}/api/v1/room/call/${roomId}`,
//         {
//           headers: {
//             authorization: localStorage.getItem('token'),
//           },
//         }
//       );

//       const { callCount } = response.data;

//       // Case 1: Joining an existing call with 0 people
//       if (callCount.length === 0) {
//         socket.emit('join-call', roomId, localStorage.getItem('userId'));
//         setIsJoined(true);
//         return;
//       }

    
      
//       // Case 2: Joining a call with multiple people
//       console.log('Joining call with multiple people:', callCount);
//       for (const userId of callCount) {
//         if(userId === localStorage.getItem('userId')){
//           console.log("Skipping self");
//           continue;
//         }
//         console.log('Creating connection with user:', userId);
//         await createConnection({ to: userId });
//       }
//       setIsJoined(true);
//     } catch (error) {
//       console.error('Error in handleStartCall:', error);
//     }
//   }

//   async function handleEndCall() {
//     try {
//       // Stop own stream if it exists
//       if (ownStream) {
//         ownStream.getTracks().forEach(track => track.stop());
//         ownStream = null;
//       }
  
//       // Close all peer connections
//       p2pConnections.current.forEach(conn => {
//         conn.instance.close();
//       });
//       p2pConnections.current = [];
  
//       // Clear all video elements
//       if (localVideoRef.current) {
//         const stream = localVideoRef.current.srcObject as MediaStream;
//         if (stream) {
//           stream.getTracks().forEach(track => track.stop());
//           localVideoRef.current.srcObject = null;
//         }
//       }
  
//       [videoRef1, videoRef2, videoRef3].forEach(ref => {
//         if (ref.current) {
//           const stream = ref.current.srcObject as MediaStream;
//           if (stream) {
//             stream.getTracks().forEach(track => track.stop());
//             ref.current.srcObject = null;
//           }
//         }
//       });
  
//       // Tell the server the user has left the call
//       socket.emit('leave-call', roomId, localStorage.getItem('userId'));
//       setIsJoined(false);
//     } catch (error) {
//       console.error('Error ending call:', error);
//     }
//   }

//   useEffect(() => {
//     console.log('Setting up socket event listeners');
//     socket.on("join-call-success", () => {
//       toast.success("Joined call successfully");
//     });
//     socket.on("join-call-error", () => {
//       toast.error("Failed to join call");
//     });
//     // Handle ICE candidates from other peers
//     socket.on('ice-candidate', data => {
//       console.log('Received ICE candidate from:', data.from);
//       setIceCandidate({from:data.from, candidate:data.candidate});
//     });

//     // Handle answers to our offers
//     socket.on('answer-created', (from: string, answer: RTCSessionDescriptionInit) => {
//       if(from === localStorage.getItem('userId')){
//         console.log("Received answer from self , ignoring will sort out later");
//         return;
//     }
//       console.log('Received answer from:', from);
      
//       let index = p2pConnections.current.findIndex(conn => conn.withUserId === from);
//       if(index === -1 && p2pConnections.current.length === 1){
//         index = 0;
//         console.log("Setting withUserId to:", from);
//         p2pConnections.current[0].withUserId = from;
//       }
//       if (index === -1  ) {
//         console.error('Cannot find connection for user:', from);
//         return;
//       }
//       const peerConnection = p2pConnections.current[index].instance;

//       console.log("Setting remote description", answer , "to:", peerConnection);
//       peerConnection
//         .setRemoteDescription(answer)
//         .then(() => {
//           console.log('Successfully set remote description (answer)');
//         })
//         .catch(err => {
//           console.error('Error setting remote description (answer):', err);
//         });

//       // Connection state monitoring
     
//     });
   
//     // Handle call status updates
//     socket.on('call-status', (callStatus: boolean) => {
//       console.log('Call status updated:', callStatus);
//       setStatus(callStatus);
//     });

//     // Handle incoming offers
//     socket.on(
//       'initiate-offer',
//       async (msg: string, sdp: RTCSessionDescriptionInit, from: string) => {
//         console.log('Received offer from:', from);
//         JoinNotification(msg);
//          await CreateAnswer(sdp, from);
//       }
//     );

//     // Cleanup function to remove all listeners
//     return () => {
//       console.log('Cleaning up socket event listeners');
//       socket.off('ice-candidate');
//       socket.off('answer-created');
//       socket.off('call-status');
//       socket.off('initiate-offer');
//       socket.off('join-call-success');
//       socket.off('join-call-error');

//       // Close and clean up any existing peer connections
//       p2pConnections.current.forEach(conn => {
//         conn.instance.close();
//       });
//       p2pConnections.current = [];
//       if (ownStream) {
//         ownStream.getTracks().forEach(track => track.stop());
//         ownStream = null;
//       }
//       if (localVideoRef.current && localVideoRef.current.srcObject) {
//         const stream = localVideoRef.current.srcObject as MediaStream;
//         stream.getTracks().forEach(track => track.stop());
//       }
//     };
//   }, []); // Empty dependency array to run once on component mount

//   return (
//     <div className="flex flex-col w-full h-64 md:h-[40.5rem] border border-t-0 border-white/15">
//       <div className="mx-3 mb-5 hover:cursor-pointer max-w-72" onClick={goBack}>
//         <IoArrowBackCircleSharp className="text-3xl hover:text-slate-400" />
//       </div>
//       <div className="flex justify-between mx-3 h-full">
//         {members &&
//           members.map((p, index: number) => (
//             <div key={index} className="w-1/2 border text-center h-fit">
//               {p.displayname}
//             </div>
//           ))}
//       </div>
//       <div className="flex flex-wrap w-full h-full">
//         <div className="w-1/2 p-2">
//           <video
//             ref={localVideoRef}
//             className="w-full h-full object-cover rounded-lg"
//             autoPlay
//             playsInline
//             muted
            
//           ></video>
//           <div className="text-center mt-1">You</div>
//         </div>
//         <div className="w-1/2 p-2">
//           <video
//             ref={videoRef1}
//             className="w-full h-full object-cover rounded-lg"
//             autoPlay
//             playsInline
           
//           ></video>
//         </div>
//         <div className="w-1/2 p-2">
//           <video
//             ref={videoRef2}
//             className="w-full h-full object-cover rounded-lg"
//             autoPlay
//             playsInline
           
//           ></video>
//         </div>
//         <div className="w-1/2 p-2">
//           <video
//             ref={videoRef3}
//             className="w-full h-full object-cover rounded-lg"
//             autoPlay
//             playsInline
//           ></video>
//         </div>
//       </div>
//       {!status ? (
//         <div
//           className="hover:cursor-pointer w-full text-center hover:bg-slate-800 py-1 self-center text-white bg-slate-600"
//           onClick={handleStartCall}
//         >
//           Start Call
//         </div>
//       ) : status && !isJoined ? (
//         <div
//           onClick={handleStartCall}
//           className="hover:cursor-pointer w-full text-center self-center hover:bg-red-800 py-1 text-white bg-red-600"
//         >
//           Join Call
//         </div>
//       ) : (
//         <div
//           onClick={handleEndCall}
//           className="hover:cursor-pointer self-center w-full text-center hover:bg-red-800 py-1 text-white bg-red-600"
//         >
//           End Call
//         </div>
//       )}
//     </div>
//   );
// }
