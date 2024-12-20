import { FormEvent } from "react";
import { controlledPlaying, nowPlaying } from "../State/playingOnState";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { io } from "socket.io-client";
import { userInfo } from "../State/userState";
import { useParams } from "react-router-dom";

const socket = io("http://192.168.0.106:5000")
interface isPlayingType {
    id:number | string;
    title: string | undefined;
    type:string;
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
            console.log(inputPlaying);
            
    socket.emit("change-video", {playing:{id:inputPlaying.id.toString(), title:inputPlaying.title, type:inputPlaying.type}, roomId})
    socket.emit("send-message", {
        name:Info.username,
        time: currentTime,
        message: `${Info.username} changed the video to ${inputPlaying?.title}`,
        userId: roomId
    });
  }


  return (<form onSubmit={handleChangeVideo} className="flex" >
    <div className="flex flex-col gap-2 p-6"><div>
      <h1 className="text-sm text-yellow-600">Enter Id</h1>
      <input
                   className="text-xs rounded-lg py-1 px-3 font-medium w-36 bg-white bg-opacity-20 text-zinc-300 placeholder-gray-500 focus:outline-none"
                   placeholder="ShowId/Url/ImdbId"
                   type="text"
                   value={inputPlaying.id} 
                   onChange={(e) => handleInputChange({id: e.target.value})} 
                 required={true}
               /></div>
               <div>
               <h1 className="text-sm text-yellow-600">Enter Show Name</h1>
               <input className="text-xs rounded-lg py-1 px-3 font-medium w-36 bg-white bg-opacity-20 text-zinc-300 placeholder-gray-500 focus:outline-none" value={inputPlaying.title} onChange={(e) => handleInputChange({ title: e.target.value})}   required={true} />
               </div>
               <div>
               <h1 className="text-sm text-yellow-600">Media Type</h1>
               <select className="text-xs rounded-lg py-1 px-3 font-medium w-36 bg-opacity-20 text-white  focus:outline-none" onChange={(e) => handleInputChange({type: e.target.value})} value={inputPlaying.type}  required={true}><option></option><option>Url<option/></option><option>Movie</option><option>Series</option><option>Anime</option></select>
               </div></div><button className="p-1 text-sm hover:bg-yellow-600 border-l px-3 border-yellow-600 hover:text-white font-bold ">Change</button></form>
  )
}