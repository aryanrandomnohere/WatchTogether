
import { FaLink } from "react-icons/fa";
import ChatBox from './ChatBox'
import { FormEvent, useState } from "react";
import { io } from "socket.io-client";
import {  useRecoilValue } from "recoil";
import { roomMessages } from "../State/roomChatState";
import { useParams } from "react-router-dom";
import { userInfo } from "../State/userState";
import { BiSend } from "react-icons/bi";
import ChatAction from "./ChatAction";

const socket = io(`${import.meta.env.VITE_BACKEND_APP_API_BASE_URl}`)

export default function FullChat() {
const [chatOptionIsOpen, setChatOptionIsOpen] = useState<boolean>(false);
const Info = useRecoilValue(userInfo)
const messages = useRecoilValue(roomMessages);
const { roomId } = useParams();
const [newMessage, setNewMessage] = useState("");

function sendMessage(e: FormEvent) {
    
        e.preventDefault();
        
        const currentTime = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    
        socket.emit("send-message", {
            displayname:Info.username,
            type:"normal",
            time: currentTime,
            message: newMessage,
            roomId: roomId
        });
    
        setNewMessage("");
    }

  return (
    <div className=""> <ChatBox messages={messages} />
                        <div className="relative flex justify-center items-center w-full">
                            <form onSubmit={sendMessage} className="flex items-center w-full">
                          <div onClick={()=>setChatOptionIsOpen((state)=> !state)} className="flex justify-center p-1 hover:cursor-pointer hover:text-yellow-600 items-center">  <FaLink className="absolute left-4 hover:cursor-pointer hover:text-yellow-600"  /></div>
    
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type here"
                                    className=" bg-slate-950 pl-10 min-w-full mr-14 rounded h-10 text-sm  md:text-base outline-8 text-yellow-600 "
                                />
                                <button type="submit" className="absolute p-0 text-xl hover:bg-black hover:cursor-pointer hover:bg-opacity-50 right-3">
                                    <BiSend className="hover:text-yellow-600" />
                                </button>
                                
                            </form>
                            {chatOptionIsOpen && <div className="absolute right-52 sm:right-72 bottom-10"><ChatAction/></div>}
                        </div></div>
  )
}
