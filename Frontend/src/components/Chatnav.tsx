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
export default function ChatNav() {
    const setChatType = useSetRecoilState(chatType)
    const socket = getSocket()
    const [connectionCount, setConnectionCount] = useState(0);
    const setRoomPeople = useSetRecoilState(people);
    useEffect(() => {
        socket.on("room-people-data", (data:number,allUser:peopleType[]) => {
            console.log(allUser);
            
            setConnectionCount(data);
            setRoomPeople(allUser)
        });

        return () => {
            socket.off("room-people-data");}
}, []);

    return (
        <div className="flex bg-slate-950 rounded-s-md text-yellow-600 justify-center gap-32  py-2  sm:py-2 px-5 md:text-md">
            <h1 className="hover:cursor-pointer" onClick={()=>setChatType(ChatType.CHATS)} >Chat</h1>
            <div className="flex gap-2">
            <div className="rounded-full px-2 text-white bg-yellow-600">{connectionCount}</div>
                <h1 className="hover:cursor-pointer" onClick={()=>setChatType(ChatType.PEOPLE)} >People</h1>
                
            </div>
          
        </div>
    );
}