import { useState } from "react";
import Button from "../ui/Button";
import { userInfo } from "../State/userState";
const socket = io("http://localhost:3000/")
export default function AddFriend() {
    const User = useRecoilValue(userInfo)
    const [fusername, setfusername] = useState("");
    const [isOpen , setIsOpen] = useState<boolean>(false);
    function sendRequest() {
socket.emit("send-friend-request",User.id, User.username, fusername)
    }
  return (
   <div className="flex flex-col justify-center w-full"><div onClick={()=>setIsOpen(!isOpen)} className="py-1 hover:cursor-pointer bg-slate-800 hover:text-yellow-600 text-center  rounded-md text-white font-bold">Find Friend</div>
  { isOpen && <div><input onChange={(e)=>setfusername(e.target.value)} value={fusername} className="bg-black bg-opacity-5 rounded-md py-1 px-2 w-full font-bold mt-2 border text-center self-center focus:outline-none focus:placeholder-transparent focus:border-yellow-600" placeholder="Enter UserId"/><Button onClick={sendRequest} w="4">Find</Button></div>}</div>)
}
