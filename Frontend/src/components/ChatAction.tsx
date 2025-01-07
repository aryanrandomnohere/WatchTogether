import { BiPoll } from "react-icons/bi";
import Actions from "./Actions";
import { useSetRecoilState } from "recoil";
import { chatType } from "../State/chatWindowState";

enum ChatType {
  CHATS,
  POLL,
  VOTES,
}

export default function ChatAction() {
  const setChatType = useSetRecoilState(chatType)
function handleCreatePoll() {
setChatType(ChatType.POLL)
}
  return (
    <div className="h-fit bg-slate-950 w-fit opacity-90 rounded-md text-white border border-yellow-600/20">
      <div className="flex flex-col p-1 justify-between h-full">
        <Actions handleClick={handleCreatePoll}>
        <div className="flex gap-1 justify-center items-center text-sm min-w-24">    <BiPoll />       Create Pol</div>
        </Actions>
      </div>
    </div>
  );
}



