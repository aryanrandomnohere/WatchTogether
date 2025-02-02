
import { FaLink } from "react-icons/fa";
import ChatBox from './ChatBox'
import { FormEvent, useEffect, useState } from "react";
import {  useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { roomMessages } from "../State/roomChatState";
import { useParams } from "react-router-dom";
import { userInfo } from "../State/userState";
import { BiSend } from "react-icons/bi";
import ChatAction from "./ChatAction";
import { replyingToState } from "../State/replyingToState";
import { GiCancel } from "react-icons/gi";
import { useOutsideClick } from "../hooks/useOutsideClick";
import getSocket from "../services/getSocket";
import { wasPlaying } from "../State/playingOnState";
import axios from "axios";
import toast from "react-hot-toast";


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




const socket = getSocket();

export default function FullChat() {
const [chatOptionIsOpen, setChatOptionIsOpen] = useState<boolean>(false);
const Info = useRecoilValue(userInfo)
const [messages, setMessages]= useRecoilState(roomMessages);
const { roomId } = useParams();
const [newMessage, setNewMessage] = useState("");
const [replyTo, setReplyTo] = useRecoilState(replyingToState)
const ref = useOutsideClick(handleClearChatOption);
const setWasPlaying = useSetRecoilState(wasPlaying);
const handleLoadState = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_APP_API_BASE_URL}/api/v1/room/loadstate/${roomId}`, {
      headers: { authorization: localStorage.getItem("token") },
    });

    setMessages(response.data.oldMessages); // State updates are async

    const { playingId: id, playingTitle: title, playingType: type, playingAnimeId: animeId } = response.data.playing;
    setWasPlaying({ id, title, type, animeId });

    socket.emit("update-status", Info.id, `Watching ${title}`);
  } catch (error) {
    console.error("Error loading state:", error);
  }
};

// Message & Poll Handlers
const handleReceiveMessage = (newMessage: Message) => {
  setMessages((prevMessages) => [...prevMessages, newMessage]); // Function-based update
};

const handleAddPoll = (newPoll: Message) => {
  setMessages((prevMessages) =>
    prevMessages.map((msg) => (msg.id === newPoll.id ? newPoll : msg))
  );
};

// Fetch initial data only once
useEffect(() => {
  handleLoadState();
}, []);

// Handle socket events (runs only once)
useEffect(() => {
  socket.on("receive-message", handleReceiveMessage);
  socket.on("new-poll", handleAddPoll);

  return () => {
    socket.off("receive-message", handleReceiveMessage);
    socket.off("new-poll", handleAddPoll);
  };
}, []); // Removed `messages` dependency


function sendMessage(e: FormEvent) {                    
        e.preventDefault();
        if(!newMessage){ 
          toast.error("Empty Input Box")
          return
          }
        const currentTime = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        if(replyTo) {
            socket.emit("send-message",{
                displayname:Info.displayname,
                type:"replyTo",
                time:currentTime,
                message:newMessage,
                roomId,
                replyTo:replyTo.chatId,
            })
        }else{
    
        socket.emit("send-message", {
            displayname:Info.displayname,
            type:"normal",
            time: currentTime,
            message: newMessage,
            roomId: roomId
        });
    }
        setReplyTo(null);
        setNewMessage("");
    }

    function handleClearReplyTo() {
        setReplyTo(null)
    }

    function handleClearChatOption() {
        setChatOptionIsOpen(false)
    }

  return (
    <div className="flex flex-col gap-0 h-full"> <ChatBox messages={messages} />

                        <div ref={ref} className={`relative ${replyTo ? "" : "mt-0" } flex flex-col h-14 justify-center items-center w-full`}>
                        {replyTo ? <div className="absolute right-0 bottom-[50px] bg-slate-950 border-l border-r border-t border-yellow-600 flex items-center justify-between w-full h-fit  rounded"><div className= "m-3 rounded  w-full  px-2 py-1 h-fit flex flex-col justify-between items-start bg-slate-800"><h1 className="text-sm text-yellow-600">{replyTo.displayname}</h1><h1 className="text-xs">{replyTo.message}</h1></div><div className="hover:cursor-pointer pr-4 pl-2 hover:text-yellow-600" onClick={handleClearReplyTo}><GiCancel/></div></div> : null}
   
                            <form onSubmit={sendMessage} className="flex items-center w-full">
                          <div  onClick={()=>setChatOptionIsOpen((state)=> !state)} className="flex justify-center w-full h-full  hover:cursor-pointer hover:text-yellow-600 items-center">  <FaLink className="absolute left-4 hover:cursor-pointer hover:text-yellow-600"  /></div>
                
                              <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type here"
                                    className=" bg-slate-950 pl-10 pr-10  min-w-full  mr-14 rounded h-10 text-sm  md:text-base outline-8 outline-blue-300 text-yellow-600 "
                                />
                                <button type="submit" className="absolute text-xl hover:bg-black hover:cursor-pointer hover:bg-opacity-50 right-3">
                                    <BiSend className="hover:text-yellow-600" />
                                </button>
                                
                            </form>
                            {chatOptionIsOpen && <div className="absolute right-52 sm:right-64 bottom-12"><ChatAction/></div>}
                        </div></div>
  )
}
