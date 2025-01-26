import axios from "axios";
import { IoMdCheckmark } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { FriendRequests } from "../State/FriendRequests";
import { useRecoilState, useRecoilValue } from "recoil";
import toast from "react-hot-toast";
import { userInfo } from "../State/userState";
import getSocket from "../services/getSocket";

const socket = getSocket()
export default function RequestActions({id, fromUsername}:{id:string, fromUsername:string}) {
  const [requests, setFriendRequests] = useRecoilState(FriendRequests)
  const  UserInfo = useRecoilValue(userInfo);

  async function handleRejection() {
    try {
      await axios.put(
        //@ts-ignore
        `${import.meta.env.VITE_BACKEND_APP_API_BASE_URL}/api/v1/social/rejectrequest`,
        { from: id },
        {
          headers: {
            authorization: localStorage.getItem("token"),
          },
        }
      );

     
      const afterDeletion = requests.filter((req) => req.fromUsername !== fromUsername); // Fixed line
      setFriendRequests(afterDeletion);
      toast.success("Request Rejected")
    } catch (error) {
      console.error("Error rejecting the friend request:", error);
    }
  }
  async function handleAcceptance(){
    console.log(UserInfo.id);
    
    const acceptdata = {
      userId: UserInfo.id,
      friendId:id,
    }

   socket.emit("accept-friend-request",acceptdata);
      const afterDeletion = requests.filter((req) => req.fromUsername !== fromUsername); // Fixed line
      await axios.put(
        //@ts-ignore
        `${import.meta.env.VITE_BACKEND_APP_API_BASE_URL}/api/v1/social/rejectrequest`,
        { from: id },
        {
          headers: {
            authorization: localStorage.getItem("token"),
          },
        }
      );
      setFriendRequests(afterDeletion);
      toast.success("Friend Request Accepted")
  }
  
  return (

    <div className="flex items-center gap-4"><div onClick={handleRejection}>
      <RxCross2 className="text-yellow-600 text-xl hover:cursor-pointer hover:text-yellow-800" /></div>
      <div onClick={handleAcceptance}><IoMdCheckmark className="text-xl hover:cursor-pointer hover:text-yellow-800  text-yellow-600"/></div></div>
  )
}
