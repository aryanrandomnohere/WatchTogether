import {  useEffect, useState } from "react";
import Series from "../components/Series";
import ChangeVideo from "../components/ChangeVideo";
import { useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import { controlledPlaying, nowPlaying, wasPlaying } from "../State/playingOnState";
import { userInfo } from "../State/userState";
import { roomMessages } from "../State/roomChatState";
import { useParams } from "react-router-dom";
import Modal from "../ui/Modal";
import { RiExchangeLine } from "react-icons/ri";
import SeasonBox from "../components/SeasonBox";
import { TfiViewList } from "react-icons/tfi";
import { epState } from "../State/epState";

import axios from "axios";  
// import { chatType } from "../State/chatWindowState";
import { isAuthenticatedState } from "../State/authState";
import ChatWindow from "../components/ChatWindow";
import { lefSideIsOpen } from "../State/leftRoomSpace";
import { FcInvite } from "react-icons/fc";
import { TbArrowBarToLeft, TbArrowBarToRight } from "react-icons/tb";
import getSocket from "../services/getSocket";
//@ts-ignore
const socket = getSocket();

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
    const [roomName, setRoomName] = useState("")
    // const [newMessage, setNewMessage] = useState("");
   const [isOpen, setIsOpen] = useRecoilState(lefSideIsOpen);
   const [chatIsOpen, setChatIsOpen ] = useState(true)
    const isAuthenticated = useRecoilValue(isAuthenticatedState);
    const controlledInput =useSetRecoilState(controlledPlaying)
    // const ChatType = useRecoilState(chatType) 
    const Info = useRecoilValue(userInfo)
const { roomId } = useParams();
   
    const isPlaying: isPlayingType = 
    playing ?? 
    wasplaying ?? 
    { id: "", title: "", type: "Custom" }; 

    
    useEffect(() => {
        if (!roomId || !isAuthenticated) return;
        
        async function fetchRoomName() {
          //@ts-ignore
         const response = await axios.get(`${import.meta.env.VITE_BACKEND_APP_API_BASE_URL}/api/v1/room/getRoomName/${roomId}`,{
          headers:{ 
            authorization:localStorage.getItem("token")
          }
         })
         setRoomName(`${response.data.roomDetails.displayname}'s Room`);

         
        }
        fetchRoomName()

      
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
        <div className="bg-gray-900 min-h-screen flex flex-col   px-1 pt-4 items-start">
           <div className="sm:mt-14 mt-28"></div>
            <div className="flex gap-2 mb-4 px-4 items-center justify-between w-full ">
              <div className="flex items-center gap-3">
              <div  onClick={()=>{if(["Series", "Anime","AnimeUrl"].includes(isPlaying.type)){
            setIsOpen(!isOpen)
            return}
              
            }} className={` `}><TfiViewList className={`hover:cursor-pointer text-2xl font-bold  ml-2 ${isOpen && ["Series", "Anime","AnimeUrl"].includes(isPlaying.type)?"text-yellow-600" :""}`}/></div>
                <div>
    <Modal>
        <Modal.open opens="changeVideo">
            <div><RiExchangeLine className="hover:cursor-pointer text-4xl "/></div>
        </Modal.open>
        <Modal.window name="changeVideo">
            <ChangeVideo />
        </Modal.window>
    </Modal>
</div>
</div>
<div className="text-xl font-bold ">{roomName}</div>
<div className="text-lg py-1 px-3 bg-yellow-600 text-white flex justify-between items-center hover:cursor-pointer gap-2 "><FcInvite className="text-xl" />Invite Link</div>

{/* <div>
    <Modal>
        <Modal.open opens="profile">
          <div className="flex justify-center items-center gap-2"><CgProfile />
                <span>Profile</span>
           </div>
          
        </Modal.open>
        <Modal.window name="profile">
           
                <ProfileActions />
               
        </Modal.window>
    </Modal>
</div> */}

           
            
            </div>

            <div className={`flex flex-col w-full md:grid ${
    isOpen && ["Series", "Anime","AnimeUrl"].includes(isPlaying.type) ? "md:grid-cols-4" : "md:grid-cols-4"
  } gap-2.5 mt-0 transition-all  `}>
  {/* Left Sidebar */}
  <div className={`w-full md:w-92  ${isOpen && ["Series", "Anime","AnimeUrl"].includes(isPlaying.type) ? "" : "hidden"}`}>
    {["Series", "Anime","AnimeUrl"].includes(isPlaying.type) && <SeasonBox tvId={isPlaying.id} />}
  </div>

  {/* Middle Content */}
  <div className={`flex w-full h-[43rem] pr-4  ${
      isOpen && ["Series", "Anime","AnimeUrl"].includes(isPlaying.type) && chatIsOpen ? "md:col-span-2" : chatIsOpen  ? "md:col-span-3": isOpen ? "md:col-span-3":"md:col-span-4"
    }`}>
  <div
    className={`flex w-full  ${
      isOpen && ["Series", "Anime","AnimeUrl"].includes(isPlaying.type) && chatIsOpen ? "md:col-span-2" : "md:col-span-4"
    } transition-all duration-700 ease-in-out justify-center items-center bg-zinc-950 min-h-full   border border-white/20 p-1.5 h-full`}
  > 
    <Series id={isPlaying.id} type={isPlaying.type} title={isPlaying.title} animeId={isPlaying.animeId} />
  </div>
  <div className=" h-full flex gap-0  items-center"><div className="w-[1px] h-full bg-white flex items-center relative"><div className="hover:cursor-pointer " onClick={()=>setChatIsOpen(!chatIsOpen)}>{!chatIsOpen ?<TbArrowBarToLeft  className=" absolute top-1/2 -right-3 text-black font-extrabold bg-white rounded-full p-1 text-2xl"/>:<TbArrowBarToRight className=" absolute top-1/2 -right-3 text-black font-extrabold bg-white rounded-full p-1 text-2xl" />}</div></div> </div>

  </div>


  {/* Right Sidebar */}
  <div className="flex ">
    
  <div className={`flex flex-col justify-between border-white/20 bg-slate-900 w-full ${chatIsOpen ? "md:col-span-1":"hidden"} h-fit md:h-auto`}>
      
    <ChatNav />
    <ChatWindow />
  </div>
  </div>
</div>

        </div>
    );
}


function ChatNav() {
    const [connectionCount, setConnectionCount] = useState(0);
    useEffect(() => {
        socket.on("room-user-count", (data:number) => {
            setConnectionCount(data);
        });

        return () => {
            socket.off("room-user-count");}
}, []);

    return (
        <div className="flex bg-slate-950 rounded-s-md text-yellow-600 justify-center gap-32  py-2  sm:py-2 px-5 md:text-md">
            <h1 className="hover:cursor-pointer" >Chat</h1>
            <div className="flex gap-2">
            <div className="rounded-full px-2 text-white bg-yellow-600">{connectionCount}</div>
                <h1 className="hover:cursor-pointer">People</h1>
                
            </div>
          
        </div>
    );
}