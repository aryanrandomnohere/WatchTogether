
import { FaLink } from "react-icons/fa";
import ChatBox from './ChatBox'
import { FormEvent, useState } from "react";
import {  useRecoilState, useRecoilValue } from "recoil";
import { roomMessages } from "../State/roomChatState";
import { useParams } from "react-router-dom";
import { userInfo } from "../State/userState";
import { BiSend } from "react-icons/bi";
import ChatAction from "./ChatAction";
import { replyingToState } from "../State/replyingToState";
import { GiCancel } from "react-icons/gi";
import { useOutsideClick } from "../hooks/useOutsideClick";
import getSocket from "../services/getSocket";

const socket = getSocket();

export default function FullChat() {
const [chatOptionIsOpen, setChatOptionIsOpen] = useState<boolean>(false);
const Info = useRecoilValue(userInfo)
const messages = useRecoilValue(roomMessages);
const { roomId } = useParams();
const [newMessage, setNewMessage] = useState("");
const [replyTo, setReplyTo] = useRecoilState(replyingToState)
const ref = useOutsideClick(handleClearChatOption);
function sendMessage(e: FormEvent) {                    
    
        e.preventDefault();
        
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
                            {chatOptionIsOpen && <div className="absolute right-52 sm:right-60 bottom-10"><ChatAction/></div>}
                        </div></div>
  )
}
