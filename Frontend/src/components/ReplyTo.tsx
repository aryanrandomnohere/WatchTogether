import { useRecoilValue } from "recoil";
import { userInfo } from "../State/userState";
import MsgAction from "./MsgAction";

interface Message {
  id: number;
  type: string;
  displayname: string;
  edited: boolean;
  multipleVotes: boolean;
  time: string;
  message: string;
  options?: Option[];
  replyTo?: Reply | null;
}

interface Option {
  chatId: number;
  option: string;
  id: number;
  votes?: Vote[] | null;
}

interface Vote {
  chatId: number;
  id: number;
  userId: string;
  optionId: number;
  user: User;
}

interface Reply {
  id: number;
  displayname: string;
  message: string;
}

interface User {
  id: string;
  displayname: string;
  username: string;
}

export default function ReplyTo({ replyTo }: { replyTo: Message }) {
  const Info = useRecoilValue(userInfo);
  const isEmojiOnly = (message: string) => {
    const emojiRegex = /^([\p{Emoji}\u200d\uFE0F]+)$/u;
    return emojiRegex.test(message);
};
  return (
    <div className="w-full min-w-full shadow-md">
      <div
        className={`flex p-2 pb-1 flex-col w-full rounded border border-stone-700 h-fit shadow-md ${
          replyTo.displayname !== Info.displayname ? "bg-slate-800" : "bg-slate-800"
        }`}
      >
        {/* Header: Display Name & Actions */}
        <div className="flex w-full justify-between">
          <div className="text-yellow-600 font-bold text-sm mb-0.5">{replyTo.displayname}</div>
          <div className="text-xs">
            <MsgAction chatId={replyTo.id} message={replyTo.message} displayname={replyTo.displayname} />
          </div>
        </div>

        {/* Reply Box */}
        <div className="flex flex-col rounded-md border-l border-l-yellow-600 bg-slate-700 w-full mb-0.5">
          <div className="px-2 py-1">
            <div className="text-yellow-600 text-sm">{replyTo.replyTo?.displayname}</div>
            <div className={` ${isEmojiOnly(replyTo.message) ? "text-4xl" : "text-sm"} ${replyTo.replyTo?.message ? "text-white" : "font-thin text-zinc-200"}`}>
              {replyTo.replyTo?.message || "Deleted for everyone"}
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div className="flex flex-col w-full items-start">
          <div className="text-sm text-white pt-1 max-w-full">{replyTo.message}</div>
          <div className="text-xs/3 font-extralight self-end">{replyTo.time}</div>
        </div>
      </div>
    </div>
  );
}

