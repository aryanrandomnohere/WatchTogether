import { useEffect, useState } from "react";
import getSocket from "../services/getSocket";
import { useSetRecoilState } from "recoil";
import { chatType } from "../State/chatWindowState";
import { people } from "../State/roomPeopleState";
  enum ChatType {
    CHATS,
    POLL,
    VOTES,
    PEOPLE
}
interface peopleType {
    displayname: string;
    username:string;
    userId:string;
    avatar:"";
}
export default function Chatnav() {
    const setChatType = useSetRecoilState(chatType)
    const socket = getSocket()
    const [connectionCount, setConnectionCount] = useState(0);
    const setRoomPeople = useSetRecoilState(people);
    useEffect(() => {
        socket.on("room-people-data", (data:number,allUser:peopleType[]) => {
            
            setConnectionCount(data);
            setRoomPeople(allUser)
        });

        return () => {
            socket.off("room-people-data");}
}, []);

    return (
        <div  className="flex bg-black  rounded-s-md text-slate-400 justify-center gap-32  py-2  sm:py-2 px-5 md:text-md">
            <h1 className="hover:cursor-pointer" onClick={()=>setChatType(ChatType.CHATS)} >Chat</h1>
            <div onClick={()=>setChatType(ChatType.PEOPLE)}  className="flex gap-2 hover:cursor-pointer">
            <div  className="rounded-full px-2 text-white bg-slate-600 hover:cursor-pointer">{connectionCount}</div>
                <h1 className="hover:cursor-pointer" >People</h1>
                
            </div>
          
        </div>
    );
}