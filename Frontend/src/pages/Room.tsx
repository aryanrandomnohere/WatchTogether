import { FormEvent, useEffect, useState } from "react";
import Series from "../components/Series";
import ChatBox from "../components/ChatBox";
import { BiSend } from "react-icons/bi";
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

const socket = io("http://192.168.0.106:5000")

interface Message {
    name: string;
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
    const [newMessage, setNewMessage] = useState("");
   const [isOpen, setIsOpen] = useState(false);
    const controlledInput =useSetRecoilState(controlledPlaying)
    const Info = useRecoilValue(userInfo)
    const { roomId } = useParams();
    const setWasPlaying = useSetRecoilState(wasPlaying);
    const isPlaying: isPlayingType = 
    playing ?? 
    wasplaying ?? 
    { id: "", title: "", type: "Custom" }; 

    
    useEffect(() => {
        if (!roomId) return;
        
        const handleLoadMessages = (oldMessages: Message[]) => {
            setMessages(oldMessages);
        };
    
        const handleLoadPlaying = (playing: { playingId: string, playingTitle: string, playingType: string,playingAnimeId:string}) => {
            const { playingId: id, playingTitle: title, playingType: type, playingAnimeId: animeId } = playing;
            setWasPlaying({ id, title, type, animeId });
            socket.emit("update-status",Info.id,`Watching ${title}`)
        };
    
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
        socket.emit("join-room", roomId);
        socket.on("receive-ep",handleChangeEp)
        socket.on("load-messages", handleLoadMessages);
        socket.on("load-playing", handleLoadPlaying);
        socket.on("receive-message", handleReceiveMessage);
        socket.on("receive-playing", handleReceivePlaying);
        
        return () => {
            // setPlaying({id:"",animeId:"",title:"",type:""})
            socket.emit("update-status",Info.id,"ONLINE")
            socket.off("receive-ep",handleChangeEp)
            socket.off("load-messages", handleLoadMessages);
            socket.off("load-playing", handleLoadPlaying);
            socket.off("receive-message", handleReceiveMessage);
            socket.off("receive-playing", handleReceivePlaying);
            socket.emit("leave-room", roomId);
        };
    }, [roomId,controlledInput,setMessages,setPlaying,setWasPlaying,Info]); 
    
    
 
    
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

    

    return (
        <div className="bg-gray-900 min-h-screen flex flex-col  px-4 pt-4 mt-24 md:mt-16 items-start">
            <div className="flex gap-2 items-center"><div  onClick={()=>setIsOpen(!isOpen)}><TfiViewList className={`hover:cursor-pointer text-2xl font-bold  ml-2 ${isOpen?"text-yellow-600" :""}`}/></div>
                <div>
                    <Modal><Modal.open opens="changeVideo"><RiExchangeLine className="hover:cursor-pointer text-4xl "/></Modal.open><Modal.window name="changeVideo"><ChangeVideo  /></Modal.window></Modal>
                </div>
               
               
      
           
            
            </div>

            <div className="flex flex-col w-full md:flex-row gap-4 mt-0">
            <div className="w-full md:w-1/6">
  {isOpen && ["Series", "Anime"].includes(isPlaying.type) && (
    <SeasonBox tvId={isPlaying.id} />
  )}
</div>

                <div className="flex w-full md:w-3/5 justify-center items-center shadow-yellow-600 bg-black shadow-sm rounded-lg p-4">

                    <Series id={isPlaying.id} type={isPlaying.type} title={isPlaying.title}  animeId={isPlaying.animeId} />
                </div>
                <div className="flex flex-col justify-between bg-slate-900 rounded-lg w-full md:w-128 h-80 md:h-auto">
                 
                    <ChatNav />
                    <ChatBox messages={messages} />
                    <div className="flex justify-center items-center w-full">
                        <form onSubmit={sendMessage} className="flex items-center w-full">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type here"
                                className="relative bg-slate-950 min-w-full pl-5 rounded h-10 text-sm  md:text-base text-yellow-600 "
                            />
                            <button type="submit" className="absolute p-0 text-xl hover:bg-black hover:cursor-pointer hover:bg-opacity-50 right-8">
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
    useEffect(() => {
        socket.on("room-user-count", (data) => {
            setConnectionCount(data);
        });

        return () => {
            socket.off("room-user-count");}
}, []);

    return (
        <div className="flex bg-slate-950 rounded-s-md text-yellow-600 justify-center gap-32  py-3 px-5 font-extrabold text-sm  md:text-base">
            <h1 className="hover:cursor-pointer">Chat</h1>
            <div className="flex gap-2">
            <div className="rounded-full px-2 text-white bg-yellow-600">{connectionCount}</div>
                <h1 className="hover:cursor-pointer">People</h1>
                
            </div>
          
        </div>
    );
}