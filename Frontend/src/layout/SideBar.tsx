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
  <Link to={`/watch/${!Info.id ? "guest" : Info.id}`} className=" flex py-2 items-center max-w-[18.5rem] justify-between bg-transparent mx-3 p-2 border hover:border-yellow-600    border-white/20 hover:text-yellow-600 hover:cursor-pointer  px-3 ">
   <div className=""> Go to your room</div><div><FaArrowsTurnRight /></div>
  </Link>
  <div onClick={() => setfOpen(!fOpen)} className="flex border-b border-b-yellow-600  hover:cursor-pointer justify-between mx-3 items-center rounded-md py-2 px-3 hover:bg-slate-950 hover:bg-opacity-40 mb-4 mt-5">
    <button className="flex justify-between w-full items-center text-yellow-600" >
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

