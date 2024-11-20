import { useRecoilValue } from "recoil";
import Friend from "./Friend";
import {Friends} from "../State/friendsState"


export default function AllFriends() {
  const FriendsValue =   useRecoilValue(Friends)
  return (
    <div className="max-h-64 overflow-y-auto">{FriendsValue.map((friend)=> (
    <Friend key={friend.id} friend={friend} />
    ))}
    </div>)
}
