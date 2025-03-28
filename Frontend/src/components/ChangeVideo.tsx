import { FormEvent } from "react";
import { controlledPlaying, nowPlaying } from "../State/playingOnState";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { userInfo } from "../State/userState";
import { useParams } from "react-router-dom";
import getSocket from "../services/getSocket";

const socket = getSocket();
interface isPlayingType {
  id:number | string;
  title: string | undefined;
  type:string;
  animeId?:string | undefined;
}



export default function ChangeVideo() {
  const [inputPlaying, setInputPlaying] = useRecoilState(controlledPlaying);
  const setPlaying = useSetRecoilState(nowPlaying);
  const { roomId } = useParams();
  const Info = useRecoilValue(userInfo)
  const handleInputChange = (updatedState: Partial<isPlayingType>) => {
    setInputPlaying((prev) => ({ ...prev, ...updatedState }));
  };
  
  function handleChangeVideo(e:FormEvent) {
    e.preventDefault();
    setPlaying(inputPlaying)
    const currentTime = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
            
            
    socket.emit("change-video", {playing:{id:inputPlaying.id.toString(), title:inputPlaying.title, type:inputPlaying.type, animeId:inputPlaying.animeId }, roomId})
    socket.emit("send-message", {
        type:"normal",
        displayname:Info.displayname || Info.username,
        time: currentTime,
        message: `Changed the video to ${inputPlaying?.title}`,
        roomId: roomId
    });
    socket.emit("update-status",Info.id,`Watching ${inputPlaying.title}`)
  }


  return (<form onSubmit={handleChangeVideo} className="flex" >
    <div className="flex flex-col gap-2 p-6">
    <div>
               <h1 className="text-sm text-slate-400">Media Type</h1>
               <select className="text-xs rounded-lg py-1 px-3 font-medium w-36 bg-opacity-20 text-white bg-slate-950  focus:outline-none" onChange={(e) => handleInputChange({type: e.target.value})} value={inputPlaying.type}  required={true}><option>AniMov</option><option>Url</option><option>Movie</option><option>Series</option><option>Anime</option><option>AnimeUrl</option></select>
               </div>
               {inputPlaying.type === "AnimeUrl" && <div>
               <h1 className="text-sm text-slate-400">Enter Anime Url </h1>
               <input className="text-xs rounded-lg py-1 px-3 font-medium w-36 bg-slate-950 bg-opacity-20 text-zinc-300 placeholder-gray-500 focus:outline-none" value={inputPlaying.animeId} onChange={(e) => handleInputChange({ animeId: e.target.value})}   required={true} placeholder="Src Url" />
               </div> }
      <div>
      <h1 className="text-sm text-slate-400">Enter Id</h1>
      <input
                   className="text-xs rounded-lg py-1 px-3 font-medium w-36 bg-slate-950 bg-opacity-20 text-zinc-300 placeholder-gray-500 focus:outline-none"
                   placeholder="ShowId/Url/ImdbId"
                   type="text"
                   value={inputPlaying.id} 
                   onChange={(e) => handleInputChange({id: e.target.value})} 
                 required={true}
               /></div>
               
               <div>
               <h1 className="text-sm text-slate-400">Enter Show Name</h1>
               <input className="text-xs rounded-lg py-1 px-3 font-medium w-36 bg-slate-950 bg-opacity-20 text-zinc-300 placeholder-gray-500 focus:outline-none" value={inputPlaying.title} onChange={(e) => handleInputChange({ title: e.target.value})} placeholder="Name"  required={true} />
               </div>
               </div><button className="p-1 text-sm hover:bg-slate-600 border-l px-3 border-slate-400 hover:text-white font-bold ">Change</button></form>
  )
}