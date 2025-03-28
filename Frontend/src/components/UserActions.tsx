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
    <div className="w-48 bg-white dark:bg-slate-800 min-w-full rounded-xl shadow-lgoverflow-hidden">
      <div className="flex flex-col py-1">
        <Modal>
          <Modal.open opens="profile">
            <Actions>
              <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                <CgProfile className="text-xl text-slate-600 dark:text-slate-300" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Profile</span>
              </div>
            </Actions>
          </Modal.open>
          <Modal.window name="profile">
            <></>
                    {/* <ProfileActions /> */}
                   
          </Modal.window>
        </Modal>

        <Actions>
          <div>
            <Modal>
              <Modal.open opens="noti">
                <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                  <LiaUserFriendsSolid className="text-xl text-slate-600 dark:text-slate-300" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Notifications</span>
                </div>
              </Modal.open>
              <Modal.window name="noti">
                <Notifications />
              </Modal.window>
            </Modal>
          </div>
        </Actions>

        <Actions>
          <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200">
            <IoSettingsOutline className="text-xl text-slate-600 dark:text-slate-300" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Settings</span>
          </div>
        </Actions>

        <div className="h-px bg-slate-100 w-full dark:bg-slate-700/50 my-1" />

        <Actions handleClick={logout}>
          <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200">
            <LuLogOut className="text-xl text-red-500 dark:text-red-400" />
            <span className="text-sm font-medium text-red-500 dark:text-red-400">Logout</span>
          </div>
        </Actions>
      </div>
    </div>
  )
}



