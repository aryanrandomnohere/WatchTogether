import { CgProfile } from "react-icons/cg";
import { IoSettingsOutline } from "react-icons/io5";
import { LuLogOut } from "react-icons/lu";
import useAuth from "../hooks/useAuth";
import { SiGoogleclassroom } from "react-icons/si";


export default function UserActions() {
  const {logout} = useAuth();
 
  return (
    <div className="h-40 bg-slate-950 w-40 opacity-90 rounded-xl text-white shadow shadow-yellow-600"><div className="flex flex-col p-2 pl-4 pb-3 justify-between h-full ">
      <div className="flex gap-2 items-center font-extralight  text-lg"><CgProfile />Profile</div>
      <div className="flex gap-2 items-center font-extralight  text-lg"><SiGoogleclassroom />Room</div>
    <div className="flex gap-2 items-center font-extralight  text-lg"><IoSettingsOutline />Setting</div>
    <div className="flex gap-2 font-extralight items-center  text-lg" onClick={logout}><LuLogOut /> Logout</div>
    </div></div>
  )
}
