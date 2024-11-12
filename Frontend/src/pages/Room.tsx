import { FormEvent, useEffect, useState } from "react";
import Series from "../components/Series";
import { GoTriangleLeft, GoTriangleRight } from "react-icons/go";
import ChatBox from "../components/ChatBox";
import { BiSend } from "react-icons/bi";
import { FaExchangeAlt } from "react-icons/fa";
import { useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import { nowPlaying, wasPlaying } from "../State/playingOnState";
import { userInfo } from "../State/userState";
import { roomMessages } from "../State/roomChatState";
import { useParams } from "react-router-dom";
import { socketAtom } from "../State/socketState";


interface Message {
    name: string;
    time: string;
    message: string;
}

export default function Room() {
    const [playing, setPlaying] = useRecoilState(nowPlaying)
    const wasplaying= useRecoilValue(wasPlaying)
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [messages, setMessages] = useRecoilState(roomMessages);
    const [newMessage, setNewMessage] = useState("");
    const isPlaying = playing || wasplaying ||"";
    const Info = useRecoilValue(userInfo)
    const { roomId } = useParams();
    const setWasPlaying = useSetRecoilState(wasPlaying);
    const socket = useRecoilValue(socketAtom);
    
    useEffect(() => {
        if (!roomId) return;
    
        socket.emit("join-room", roomId);
        socket.on("load-messages", (oldMessages: Message[]) => {
            setMessages(oldMessages);
        });


        socket.on("load-playing",(playing)=>{console.log(playing);
            setWasPlaying(playing.playing)
        })
    
        // Listen for incoming messages
        socket.on("receive-message", (newMessage: Message) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });
        socket.on("receive-playing", ({playing})=>{setPlaying(playing);}
        )

        return () => {
            socket.off("load-messages");
            socket.off("receive-message");
            socket.emit("leave-room", roomId); // Optionally leave room on unmount
        };
    }, [roomId]);
    

    function sendMessage(e: FormEvent) {
        e.preventDefault();
        
        const currentTime = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    
        socket.emit("send-message", {
            name:Info.username,
            time: currentTime,
            message: newMessage,
            userId: roomId
        });
    
        setNewMessage("");
    }

    function ChangeVideo() {
        const currentTime = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
        socket.emit("change-video", {url:playing, roomId})
        socket.emit("send-message", {
            name:Info.username,
            time: currentTime,
            message: `${Info.username} changed the video to ${playing}`,
            userId: roomId
        });
    }

    return (
        <div className="bg-gray-900 min-h-screen flex flex-col items-center px-4 pt-4 mt-24 md:mt-16 sm:items-start">
            <div className="flex gap-1">
                <div onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <GoTriangleRight className="text-2xl hover:cursor-pointer" /> : <GoTriangleLeft className="text-2xl hover:cursor-pointer" />}
                </div>
                {isOpen && (
                    <div className="flex items-center gap-2 w-full sm:w-1/2 lg:w-1/3">
                        <input
                            className=" text-xs rounded-lg py-1 px-3 font-medium bg-white bg-opacity-20 text-zinc-300 placeholder-gray-500 focus:outline-none"
                            placeholder="Enter IMDb ID or a download link to stream"
                            value={playing}
                            onChange={(e) => setPlaying(e.target.value)}
                        /><button className="left-60" onClick={ChangeVideo}><FaExchangeAlt className="text-yellow-900" />
                    </button></div>
                )}
            </div>

            <div className="w-full grid grid-cols-4 gap-4 mt-0">
                <div className="flex justify-center items-center col-span-4 sm:col-span-3 bg-zinc-900 bg-opacity-90 shadow-sm shadow-yellow-600 rounded-lg p-4">
                    <Series imdbId={isPlaying} />
                </div>
                <div className="flex flex-col justify-between bg-slate-900 border border-black rounded-lg col-span-4 md:col-span-1 h-80 md:h-auto">
                    {/* <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Type display name"
                        className="input bordered"
                    /> */}
                    <ChatNav />
                    <ChatBox messages={messages} />
                    <div className="flex justify-center items-center">
                        <form onSubmit={sendMessage} className="flex items-center">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type here"
                                className="relative bg-slate-950 input input-bordered w-92 md:w-128 md:h-11 text-sm md:text-base py-0 h-9 text-yellow-600"
                            />
                            <button type="submit" className="absolute p-0 text-lg hover:bg-black hover:cursor-pointer hover:bg-opacity-50 right-8">
                                <BiSend />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}


function ChatNav() {
    const [connectionCount, setConnectionCount] = useState(0);
    const socket = useRecoilValue(socketAtom);
    useEffect(() => {
        socket.on("room-user-count", (data) => {
            setConnectionCount(data);
        });

        return () => {
            socket.off("room-user-count");}
}, []);

    return (
        <div className="flex bg-slate-950 rounded-s-md text-yellow-600 justify-between p-3 font-extrabold">
            <h1 className="hover:cursor-pointer ml-3">Chat</h1>
            <div className="flex gap-2">
                <h1 className="hover:cursor-pointer">People</h1>
                <div className="rounded-full px-2 text-white bg-yellow-600">{connectionCount}</div>
            </div>
            <h1 className="hover:cursor-pointer ml-3">Settings</h1>
        </div>
    );
}
