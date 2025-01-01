import {  useEffect, useState } from "react";
import Series from "../components/Series";
import ChangeVideo from "../components/ChangeVideo";
import { useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import { controlledPlaying, nowPlaying, wasPlaying } from "../State/playingOnState";
import { userInfo } from "../State/userState";
import { roomMessages } from "../State/roomChatState";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Modal from "../ui/Modal";
import { RiExchangeLine } from "react-icons/ri";
import SeasonBox from "../components/SeasonBox";
import { TfiViewList } from "react-icons/tfi";
import { epState } from "../State/epState";

import axios from "axios";
// import { chatType } from "../State/chatWindowState";
import { isAuthenticatedState } from "../State/authState";
import ChatWindow from "../components/ChatWindow";

const socket = io(`http://192.168.0.104:3000`)

interface Message {
    id: number;
    type:string;
    displayname: string;
    edited: boolean;
    multipleVotes: boolean;
    time: string;
    message: string;
    options?: Option[]; 
    replyTo?: Reply | null; 
  }
  
  interface Option {
    chatId:number;
    option: string;
    id: number;
    votes?: Vote[]|null; 
  }
  
  interface Vote {
    chatId:number;
    userId:string;
    id: number;
    optionId: number;
    user: User;
  }
  
  interface User {
    id: string;
    displayname: string;
    username: string; 
  }
  
  interface Reply {
    id: number;
    displayname: string;
    edited: boolean;
    time: string;
    message: string;
  }

interface isPlayingType {
    id:number | string;
    title: string | undefined;
    type:string;
    animeId?:string | undefined;
}


export default function Room() {
    const setEp = useSetRecoilState(epState);
    const [playing, setPlaying] = useRecoilState(nowPlaying)
    const wasplaying= useRecoilValue(wasPlaying)
    const [messages, setMessages] = useRecoilState(roomMessages);
    // const [newMessage, setNewMessage] = useState("");
   const [isOpen, setIsOpen] = useState(false);
    const isAuthenticated = useRecoilValue(isAuthenticatedState);
    const controlledInput =useSetRecoilState(controlledPlaying)
    // const ChatType = useRecoilState(chatType) 
    const Info = useRecoilValue(userInfo)
    const { roomId } = useParams();
    const setWasPlaying = useSetRecoilState(wasPlaying);
    const isPlaying: isPlayingType = 
    playing ?? 
    wasplaying ?? 
    { id: "", title: "", type: "Custom" }; 

    
    useEffect(() => {
        if (!roomId || !isAuthenticated) return;
        
        const handleLoadState = async () => {   
            const response = await axios.get(`http://192.168.0.104:3000/api/v1/room/loadstate/${roomId}`,
        {
            headers:{
                authorization: localStorage.getItem("token")
            }
        })
        setMessages(response.data.oldMessages)
        const { playingId: id, playingTitle: title, playingType: type, playingAnimeId: animeId } = response.data.playing;
        setWasPlaying({ id, title, type, animeId });
        socket.emit("update-status",Info.id,`Watching ${title}`)
        };
        handleLoadState()
      
        const handleReceiveMessage = (newMessage: Message) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        };
    
        const handleReceivePlaying = (playing: { playingId: string, playingTitle: string, playingType: string, playingAnimeId:string }) => {
            
            const { playingId: id, playingTitle: title, playingType: type, playingAnimeId: animeId } = playing;
            setPlaying({ id, title, type, animeId });
            controlledInput({ id, title, type, animeId });
            socket.emit("update-status",Info.id,`Watching ${title}`)
        };
         const handleChangeEp = async (episode:number,season:number)=>{ 
            setEp((prevEp) => ({
                ...prevEp, 
                episode_number: episode,
                season_number: season,
            }));
            
             }

//             const handleAddVote = ({
//   chatId,
//   optionId,
//   id,
//   userId,
//   user,
// }: {
//   chatId: number;
//   optionId: number;
//   id: number;
//   userId: string;
//   user: User;
// }) => {
//   const updatedMessages = messages.map((message: Message) => {
//     if (message.id === chatId) {
//       const updatedOptions = message.options?.map((option) => {
//         if (option.id === optionId) {
//           // Remove any existing vote by the user and add the new vote
//           const updatedVotes = (option.votes || []).filter((vote) => vote.userId !== userId);
//           const finalVotes = [...updatedVotes, { id, userId, chatId, optionId, user }];
//           return { ...option, votes: finalVotes };
//         }
//         return option;
//       });
//       return { ...message, options: updatedOptions };
//     }
//     return message;
//   });

//   setMessages(updatedMessages);
// };

// const handleDeleteVote = ({
//   chatId,
//   optionId,
//   id,
// }: {
//   chatId: number;
//   optionId: number;
//   id: number;
// }) => {
//   const updatedMessages = messages.map((message: Message) => {
//     if (message.id === chatId) {
//       const updatedOptions = message.options?.map((option) => {
//         if (option.id === optionId) {
//           const updatedVotes = (option.votes || []).filter((vote) => vote.id !== id);
//           return { ...option, votes: updatedVotes };
//         }
//         return option;
//       });
//       return { ...message, options: updatedOptions };
//     }
//     return message;
//   });

//   setMessages(updatedMessages);
// };

async function handleAddPoll(message:Message){
  console.log(message);
  
const newMessages = messages.map((msg)=>{
  if(msg.id === message.id)
  {
   return message
  }
  return msg
})
setMessages(newMessages)
}              

        socket.emit("join-room", roomId);
        socket.on("receive-ep",handleChangeEp)
   
        socket.on("receive-message", handleReceiveMessage);
        socket.on("receive-playing", handleReceivePlaying);
        socket.on("new-poll", handleAddPoll)
       
        return () => {
            // setPlaying({id:"",animeId:"",title:"",type:""})
           if(isAuthenticated) socket.emit("update-status",Info.id,"ONLINE")
            socket.off("receive-ep",handleChangeEp)
            socket.off("receive-message", handleReceiveMessage);
            socket.off("receive-playing", handleReceivePlaying);
            socket.emit("leave-room", roomId);
            socket.off("new-poll", handleAddPoll);
        };
    }, [roomId,Info]); 
    
 
    
    // function sendMessage(e: FormEvent) {
    
    //     e.preventDefault();
        
    //     const currentTime = new Date().toLocaleTimeString([], {
    //         hour: '2-digit',
    //         minute: '2-digit'
    //     });
    
    //     socket.emit("send-message", {
    //         displayname:Info.username,
    //         type:"normal",
    //         time: currentTime,
    //         message: newMessage,
    //         roomId: roomId
    //     });
    
    //     setNewMessage("");
    // }

    

    return (
        <div className="bg-gray-900 min-h-screen flex flex-col  px-4 pt-4 mt-22 md:mt-12 items-start">
            <div className="flex gap-2 mb-4 items-center"><div  onClick={()=>setIsOpen(!isOpen)} className={` `}><TfiViewList className={`hover:cursor-pointer text-2xl font-bold  ml-2 ${isOpen?"text-yellow-600" :""}`}/></div>
                <div>
                    <Modal><Modal.open opens="changeVideo"><RiExchangeLine className="hover:cursor-pointer text-4xl "/></Modal.open><Modal.window name="changeVideo"><ChangeVideo  /></Modal.window></Modal>
                </div>
               
      
           
            
            </div>

            <div className="flex flex-col w-full md:flex-row gap-2.5 mt-0">
            <div className="w-full md:w-2/6">
  {isOpen && ["Series", "Anime"].includes(isPlaying.type) && (
    <SeasonBox tvId={isPlaying.id}  />
  )}
</div>

                <div className={`flex w-full ${isOpen ? "md:w-3/5": "md:w-4/5"} transition-all duration-700 ease-in-out justify-center items-center  bg-zinc-950/80 border border-white/20 p-1.5`}>

                    <Series id={isPlaying.id} type={isPlaying.type} title={isPlaying.title}  animeId={isPlaying.animeId} />
                </div>
                <div className="flex flex-col justify-between border-b border-l border-r border-white/20 bg-slate-900  w-full md:w-3/5 h-fit mr-72  md:h-auto">
                 
                    <ChatNav />
                   <ChatWindow/>
                </div>
            </div>
        </div>
    );
}


function ChatNav() {
    const [connectionCount, setConnectionCount] = useState(0);
    useEffect(() => {
        socket.on("room-user-count", (data) => {
            setConnectionCount(data);
        });

        return () => {
            socket.off("room-user-count");}
}, []);

    return (
        <div className="flex bg-slate-950 rounded-s-md text-yellow-600 justify-center gap-32  py-2  sm:py-3 px-5 md:text-md">
            <h1 className="hover:cursor-pointer" >Chat</h1>
            <div className="flex gap-2">
            <div className="rounded-full px-2 text-white bg-yellow-600">{connectionCount}</div>
                <h1 className="hover:cursor-pointer">People</h1>
                
            </div>
          
        </div>
    );
}