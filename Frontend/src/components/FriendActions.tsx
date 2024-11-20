import { HiPlusSm } from "react-icons/hi";
import { LiaJointSolid } from "react-icons/lia";



export default function FriendActions() {
  return (
    <div className="flex items-center gap-3">
      <LiaJointSolid className="text-yellow-600 text-lg hover:cursor-pointer hover:text-yellow-800" />
      <HiPlusSm className="text-2xl hover:cursor-pointer hover:text-yellow-800  text-yellow-600"/>
      </div>
  )
}
