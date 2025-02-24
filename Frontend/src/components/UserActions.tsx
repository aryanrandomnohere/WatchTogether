import { CgProfile } from "react-icons/cg";
import { IoSettingsOutline } from "react-icons/io5";
import { LuLogOut } from "react-icons/lu";
import useAuth from "../hooks/useAuth";
// import { SiGoogleclassroom } from "react-icons/si";
import { LiaUserFriendsSolid } from "react-icons/lia";
import Modal from "../ui/Modal";
import Notifications from "./Notifications";
import Actions from "./Actions";
// import ProfileActions from "./Profile/ProfileActions";



export default function UserActions() {
  const {logout} = useAuth();
  return (
    <div className="h-40 bg-black  w-40 opacity-90 rounded-xl text-white shadow shadow-yellow-600"><div className="flex flex-col p-2 pl-4 pb-3 justify-between h-full ">
    <div>
        <Modal>
            <Modal.open opens="profile">
              <Actions><div className="flex justify-center items-center gap-2"><CgProfile />
                    <span>Profile</span>
               </div></Actions>
              
            </Modal.open>
            <Modal.window name="profile">
               <></>
                    {/* <ProfileActions /> */}
                   
            </Modal.window>
        </Modal>
    </div>
      <Actions><div><Modal> <Modal.open opens="noti"><div className="flex items-center justify-center gap-2"><LiaUserFriendsSolid className="text-lg" />Notifications</div></Modal.open><Modal.window name="noti"><Notifications/></Modal.window></Modal></div></Actions>
    <Actions><IoSettingsOutline />Setting</Actions>
    <Actions handleClick={logout}><LuLogOut /> Logout</Actions>
    </div></div>
  )
}



