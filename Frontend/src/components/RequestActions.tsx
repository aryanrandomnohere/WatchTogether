import axios from "axios";
import { IoMdCheckmark } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { FriendRequests } from "../State/FriendRequests";
import { useRecoilState, useRecoilValue } from "recoil";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { userInfo } from "../State/userState";

const socket = io("http://localhost:3000/", { autoConnect: true });
export default function RequestActions({id, fromUsername}:{id:string, fromUsername:string}) {
  const [requests, setFriendRequests] = useRecoilState(FriendRequests)
  const  UserInfo = useRecoilValue(userInfo);

  async function handleRejection() {
    try {
      await axios.put(
        "http://localhost:3000/api/v1/social/rejectrequest",
        { from: id },
        {
          headers: {
            authorization: localStorage.getItem("token"),
          },
        }
      );

      toast.success("Request Rejected")
      const afterDeletion = requests.filter((req) => req.fromUsername !== fromUsername); // Fixed line
    
  
      setFriendRequests(afterDeletion);
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
  }
  
  return (

    <div className="flex items-center gap-4"><div onClick={handleRejection}>
      <RxCross2 className="text-yellow-600 text-xl hover:cursor-pointer hover:text-yellow-800" /></div>
      <div onClick={handleAcceptance}><IoMdCheckmark className="text-xl hover:cursor-pointer hover:text-yellow-800  text-yellow-600"/></div></div>
  )
}
