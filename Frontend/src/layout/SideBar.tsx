import { useState } from "react";
import { MdArrowForwardIos} from "react-icons/md";


import UserDisplay from "../components/UserDisplay";

export default function SideBar({toggle}:{toggle?:()=>void;}) {
   const [fOpen, setfOpen] = useState(false);
   console.log(toggle);
  return (
    <div className="flex flex-col h-screen w-full justify-between">
  {/* Header with toggle button */}
  <div className="flex border-b justify-between items-center rounded-md py-2 px-3 hover:bg-slate-950 hover:bg-opacity-40">
    <button className="flex justify-between w-full items-center" onClick={() => setfOpen(!fOpen)}>
      Friends <MdArrowForwardIos  className={`text-sm ${fOpen? "rotate-90": ""}`} />
    </button>
  </div>

  {/* Sidebar content, add more here as needed */}
  <div className="flex-1">
    {/* Your main content for the sidebar */}
  </div>
<UserDisplay/>
  
  
</div>
 )
}

