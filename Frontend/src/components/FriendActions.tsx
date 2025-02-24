import { HiPlusSm } from "react-icons/hi";
import { LiaJointSolid } from "react-icons/lia";
import { useRecoilValue } from "recoil";
import { userInfo } from "../State/userState";
import getSocket from "../services/getSocket";

const socket = getSocket()

export default function FriendActions({to}:{to:string}) {
 const userInfovalue = useRecoilValue(userInfo);
 const {id:from, username:fromUsername} = userInfovalue;


 function handleSendInvite(){
  socket.emit("send-invite",from,fromUsername,to)
 }

 function handleJoinRequest(){
  socket.emit("request-join",from,fromUsername,to)
 }


  return (
    <div className="flex items-center gap-3">
      <div onClick={handleJoinRequest}><LiaJointSolid className="text-slate-400 text-lg hover:cursor-pointer hover:border-b-slate-400" /></div>
      <div onClick={handleSendInvite} ><HiPlusSm className="text-2xl hover:cursor-pointer hover:border-b-slate-400  text-slate-400"/></div>
      </div>
  )
}
