import { useEffect} from "react";
import { useRecoilState } from "recoil";
import { socketAtom } from "../State/socketState";

export default function useSocket(userId:string) {
    const [socket] = useRecoilState(socketAtom);
    useEffect(() => {
        socket.connect();
        socket.emit("register", userId );
        socket.on("load-friends",(actualFriends)=>{
            
        })
        return () => {
          
        };
    }, []);
}
