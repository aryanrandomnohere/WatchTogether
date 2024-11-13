import { useRecoilValue } from "recoil";
import Avatar from "./Avatar";
import FriendActions from "./FriendActions";
import { Friends } from "../State/friendsState";

export default function Friend({friend="Aryan"}) {
  const AllFriends = useRecoilValue(Friends);

  if (!AllFriends) return <div>There are no friend present</div>

  return (
    <div className="text-white py-1.5 px-3 rounded-md hover:bg-slate-600 hover:bg-opacity-10">
      <div><div className="flex items-center justify-between gap-3">
        <div className="flex gap-2"><Avatar r="9" name={friend} /><div className="flex flex-col font-bold gap-0 justify-center items-start">
          <h1 className="hover:text-blue-800 hover:cursor-pointer">Aryan Rathore</h1><p className="font-extralight text-sm">Online</p></div></div><div><FriendActions /></div></div>
          </div></div>
  )
}
