import { useRecoilValue } from "recoil"
import { chatType } from "../State/chatWindowState"
import FullChat from "./FullChat"
import PollWindow from "./PollWindow"


enum ChatType {
    CHATS,
    POLL,
    VOTES,
}
export default function ChatWindow() {
 const Type = useRecoilValue(chatType)
    return (
    <div className=" h-fit max-h-[450px] sm:max-h-full">{Type === ChatType.CHATS? <FullChat/>: Type === ChatType.POLL? <PollWindow/> :<></> }</div>
  )
}
