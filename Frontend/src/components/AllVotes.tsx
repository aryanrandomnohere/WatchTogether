import { IoArrowBackCircleSharp } from "react-icons/io5";
import { useSetRecoilState } from "recoil";
import { chatType } from "../State/chatWindowState";

enum ChatType {
    CHATS,
    POLL,
    VOTES,
}

export default function AllVotes() {
const setChatType = useSetRecoilState(chatType)
    function goBack() {
        setChatType(ChatType.CHATS)
      }
  return (
    <div className=" flex flex-col justify-between w-full h-64 md:h-[40rem]">
        <div className="mx-3 mb-10 hover:cursor-pointer max-w-72" onClick={goBack}><IoArrowBackCircleSharp className="text-3xl hover:text-slate-400" /></div>
        <div>AllVotes</div></div>
  )
}
