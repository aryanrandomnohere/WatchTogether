import { IoArrowBackCircleSharp } from "react-icons/io5"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { chatType } from "../State/chatWindowState"
import { people } from "../State/roomPeopleState"
import getSocket from "../services/getSocket"
import { useParams } from "react-router-dom"
import { userInfo } from "../State/userState"
import { useEffect } from "react"
import toast from "react-hot-toast"

enum ChatType {
    CHATS,
    POLL,
    VOTES,
}
const socket = getSocket()
export default function Peoples() {
    const setChatType = useSetRecoilState(chatType)
    const members = useRecoilValue(people)
    const Info = useRecoilValue(userInfo)
    const {roomId} = useParams()
    useEffect(()=>{
            socket.on("multiple-call-error",(msg:string)=>{
                toast.error(msg);
            })
            socket.on("offer-made",(msg:string)=>{
                toast.success(msg);
            })
        return ()=>{
            socket.off("multiple-call-error")
            socket.off("offer-made")
        }
    },[])

    const handleCall = ()=>{
        const membersId = members?.map((mem)=>mem.userId)
    socket.emit("initiate-offer",roomId,{id:Info.id, username:Info.username},membersId,"sdp")  
    }
    function goBack() {
        setChatType(ChatType.CHATS)
      }
  return (
     <div className=" flex flex-col  w-full h-64 md:h-[40rem]">
            <div className="mx-3 mb-5 hover:cursor-pointer max-w-72" onClick={goBack}><IoArrowBackCircleSharp className="text-3xl hover:text-yellow-600" /></div>
           <div className="flex justify-between mx-3 h-full"> {members && members.map((p)=><div className=" w-1/2 border text-center h-fit">{p.displayname}</div>)}</div>
           <div  className="hover:cursor-pointer w-24 text-center rounded text-yellow-600  border border-yellow-600 hover:text-white hover:bg-yellow-600 " onClick={handleCall}>Send Offer</div>
           </div>
  )
}
