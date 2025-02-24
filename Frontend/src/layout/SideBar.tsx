import { useState } from "react";
import { MdArrowForwardIos} from "react-icons/md";
import { FaArrowsTurnRight } from "react-icons/fa6";
import UserDisplay from "../components/UserDisplay";
import AddFriend from "../components/AddFriend";
import Notifications from "../components/Notifications";
import AllFriends from "../components/AllFriends";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { userInfo } from "../State/userState";



export default function SideBar() {
   const Info = useRecoilValue(userInfo)
   const [fOpen, setfOpen] = useState(false);
   
   
  return (
    <div className="flex flex-col h-screen w-full  justify-between">
  {/* Header with toggle button */}
  <Link
  to={`/watch/${Info.id || "guest"}`}
  className="flex items-center rounded justify-between max-w-[18.5rem] px-4 py-2 mx-3 border-b border-slate-400 font-semibold transition-all bg-transparent  hover:bg-black  text-white hover:cursor-pointer"
  aria-label="Go to your room"
>
  <span>Go to your room</span>
  <FaArrowsTurnRight className="text-slate-400" />
</Link>

  <div onClick={() => setfOpen(!fOpen)} className="flex border-b border-b-slate-400  hover:cursor-pointer justify-between mx-3 items-center rounded-md py-2 px-3 hover:bg-black  hover:bg-opacity-40 mb-4 mt-5">
    <button className="flex justify-between w-full items-center text-slate-400" >
   <div className="flex items-center justify-center "><div className="` text-white text-lg">Friends</div> </div><MdArrowForwardIos  className={`text-sm ${fOpen? "rotate-90": ""}`} />
    </button>    
  </div><div className="flex flex-col gap-1 ml-1 px-3 w-full ">
  {fOpen && <AllFriends/>}
  {fOpen && <AddFriend />}
  { <Notifications/> }
  </div>
  

  {/* Sidebar content, add more here as needed */}
  <div className="flex-1">
  </div>
<UserDisplay/>
  
  
</div>
 )
}

