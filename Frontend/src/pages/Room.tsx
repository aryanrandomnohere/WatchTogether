import {  useEffect, useState } from "react";
import Series from "../components/Series";
import ChangeVideo from "../components/ChangeVideo";
import { useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import { controlledPlaying, nowPlaying, wasPlaying } from "../State/playingOnState";
import { userInfo } from "../State/userState";
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
import ChatNav from "../components/Chatnav";
import AlertBox from "../ui/AlertBox";
//@ts-ignore
const socket = getSocket();


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
           

        socket.emit("join-room", roomId, {displayname:Info.displayname,username:Info.username,userId:Info.id,avatar:Info.avatar});
        socket.on("receive-ep",handleChangeEp)
        socket.on("receive-playing", handleReceivePlaying);
       
        return () => {
            // setPlaying({id:"",animeId:"",title:"",type:""})
           if(isAuthenticated) socket.emit("update-status",Info.id,"ONLINE")
            socket.off("receive-ep",handleChangeEp)
            socket.off("receive-playing", handleReceivePlaying);
            socket.emit("leave-room", roomId);
        };
    }, [roomId,Info]); 
    
 
    
    

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
<AlertBox><AlertBox.open opens="inviteLink"><div className="text-lg py-1 px-3 bg-yellow-600 text-white flex justify-between items-center hover:cursor-pointer gap-2 hover:bg-yellow-800 "><FcInvite className="md:text-xl" />Invite Link</div></AlertBox.open><AlertBox.window name="inviteLink"><div className="h-44 px-16 py-10">Copy your invite link and share it to your friends to watch togethre</div></AlertBox.window></AlertBox>
            </div>

            <div className={`flex flex-col w-full md:grid ${
    isOpen && ["Series", "Anime","AnimeUrl"].includes(isPlaying.type) ? "md:grid-cols-4" : "md:grid-cols-4"
  } gap-2.5 mt-0 transition-all  `}>
  {/* Left Sidebar */}
  <div className={`w-full md:w-92  ${isOpen && ["Series", "Anime","AnimeUrl"].includes(isPlaying.type) ? "" : "hidden"}`}>
    {["Series", "Anime","AnimeUrl"].includes(isPlaying.type) && <SeasonBox tvId={isPlaying.id} />}
  </div>

  {/* Middle Content */}
  <div className={`flex w-full md:h-[43rem] pr-4  ${
      isOpen && ["Series", "Anime","AnimeUrl"].includes(isPlaying.type) && chatIsOpen ? "md:col-span-2" : chatIsOpen  ? "md:col-span-3": isOpen ? "md:col-span-3":"md:col-span-4"
    }`}>
  <div
    className={`flex w-full  ${
      isOpen && ["Series", "Anime","AnimeUrl"].includes(isPlaying.type) && chatIsOpen ? "md:col-span-2" : "md:col-span-4"
    } transition-all duration-700 ease-in-out justify-center items-center bg-zinc-950 min-h-full   border border-white/20 p-1.5 h-full`}
  > 
    <Series id={isPlaying.id} type={isPlaying.type} title={isPlaying.title} animeId={isPlaying.animeId} />
  </div>
  <div className="  h-full  gap-0 hidden md:block  items-center"><div className="w-[1px] h-full bg-white flex items-center relative"><div className="hover:cursor-pointer " onClick={()=>setChatIsOpen(!chatIsOpen)}>{!chatIsOpen ?<TbArrowBarToLeft  className=" absolute top-1/2 -right-3 text-black font-extrabold bg-white rounded-full p-1 text-2xl"/>:<TbArrowBarToRight className=" absolute top-1/2 -right-3 text-black font-extrabold bg-white rounded-full p-1 text-2xl" />}</div></div> </div>

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


