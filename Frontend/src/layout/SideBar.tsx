import { useState } from "react";
import { MdArrowForwardIos} from "react-icons/md";


import UserDisplay from "../components/UserDisplay";
import AddFriend from "../components/AddFriend";
import Notifications from "../components/Notifications";
import AllFriends from "../components/AllFriends";



export default function SideBar() {
   const [fOpen, setfOpen] = useState(false);
   
  return (
    <div className="flex flex-col h-screen w-full  justify-between">
  {/* Header with toggle button */}
  <div className="flex border-b border-b-yellow-600  justify-between mx-5 items-center rounded-md py-2 px-3 hover:bg-slate-950 hover:bg-opacity-40 mb-4 mt-5">
    <button className="flex justify-between w-full items-center text-yellow-600" onClick={() => setfOpen(!fOpen)}>
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

