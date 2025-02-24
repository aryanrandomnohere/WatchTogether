


import { useRecoilValue } from "recoil";
import MsgAction from "./MsgAction";
import { userInfo } from "../State/userState";
export default function Chats({ chat }: { chat: { displayname: string; message: string; time: string; id:number} }) {
  const Info  = useRecoilValue(userInfo)
  const isEmojiOnly = (message: string) => {
    const emojiRegex = /^([\p{Emoji}\u200d\uFE0F]+)$/u;
    return emojiRegex.test(message);
};
  return (
    <div className={` border shadow-md border-stone-700 ${chat.displayname !== Info.displayname ? "bg-slate-800":"bg-slate-800" }  h-fit rounded p-2 pb-1   text-xs  w-full  shadow-md`}>
      <div className=" pl-1 flex flex-col h-full justify-between">
        <div className="flex justify-between items-center mb-1">
         <div className="flex gap-2 justify-center items-center"> <h4 className="font-bold text-slate-400 text-sm  ">{chat.displayname}</h4>
        </div>
          <div><MsgAction chatId={chat.id} message={chat.message} displayname={chat.displayname} /></div>
        </div>
        <div className="flex flex-col w-full  items-start"><div className={` ${isEmojiOnly(chat.message) ? "text-3xl" : "text-sm"} text-white pt-1 max-w-full`}>{chat.message}</div><div className="text-xs/3 font-extralight self-end" >{chat.time}</div></div>
        </div>
    </div>
  );
} 