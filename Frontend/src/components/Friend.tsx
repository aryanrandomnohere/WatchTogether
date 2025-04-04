import { useRecoilValue } from "recoil";
import Avatar from "./Avatar";
import FriendActions from "./FriendActions";
import { Friends } from "../State/friendsState";
import {motion} from "framer-motion"
interface Friend {
  id:string;
  status:string;
  displayname:string;
  username:string
}
export default function Friend({friend}:{friend:Friend}) {
  const AllFriends = useRecoilValue(Friends);

  if (!AllFriends) return <div>There are no friend present</div>

  return (
    <motion.div className="text-white py-1.5 px-3 rounded-md hover:bg-slate-600 hover:bg-opacity-10">
      <div><div className="flex items-center justify-between gap-3">
        <div className="flex gap-2"><Avatar r="9" name={friend.username} /><div className="flex flex-col font-bold gap-0 justify-center items-start">
          <h1 className="hover:text-blue-800 hover:cursor-pointer">{friend.username}</h1><p className={`font-extralight  text-sm ${friend.status !== "OFFLINE"?"text-orange-400":""}`}>{friend.status}</p></div></div><div><FriendActions to={friend.id} /></div></div>
          </div></motion.div>
  )
}
