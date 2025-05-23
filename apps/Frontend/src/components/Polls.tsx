import { TiTick } from 'react-icons/ti';

import { useRecoilValue, useSetRecoilState } from 'recoil';

import { chatType } from '../State/chatWindowState';
import { userInfo } from '../State/userState';
import MsgAction from './MsgAction';
import Option from './Option';

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
enum ChatType {
  CHATS,
  POLL,
  VOTES,
  PEOPLE,
}

export default function Polls({ poll }: { poll: Message }) {
  const Info = useRecoilValue(userInfo);
  const setChatType = useSetRecoilState(chatType);
  const totalVotes =
    poll.options?.reduce((ac, op) => {
      return (ac += op?.votes?.length || 0);
    }, 0) || 0;
  if (poll.options)
    return (
      <div
        className={`flex flex-col shadow-md p-2 pl-4 rounded border border-slate-300 dark:border-stone-700 w-full justify-center ${poll.displayname !== Info.displayname ? 'bg-slate-300 dark:bg-slate-800' : 'bg-slate-300 dark:bg-slate-800'}`}
      >
        <div className="flex justify-between w-full h-full items-center ">
          <div className="text-sm text-slate-700 dark:text-slate-400 font-bold">
            {poll.displayname}
          </div>
          <div className="text-xs">
            <MsgAction message={poll.message} chatId={poll.id} displayname={poll.displayname} />
          </div>
        </div>
        <div className="font-bold flex flex-col gap-1 text-slate-800 dark:text-white mt-1   ">
          {poll.message}
        </div>
        {poll.multipleVotes ? (
          <div className="flex items-center text-xs  mt-1">
            <TiTick className="rounded-full text-slate-100 bg-slate-600" />
            <TiTick className="rounded-full text-slate-100 bg-slate-600 mr-1" /> Select one or more
          </div>
        ) : (
          <div className="text-xs flex mt-1 items-center ">
            <TiTick className="rounded-full text-slate-100 bg-slate-600 mr-1" />
            Select one
          </div>
        )}
        <div className="mt-2">
          {poll.options.map(option => (
            <Option key={option.id} option={option} totalVotes={totalVotes} />
          ))}
        </div>
        <div className="text-xs flex justify-end mt-1 text-slate-600 dark:text-slate-400">
          {poll.time}
        </div>
        <div
          className="flex w-full justify-center pt-2 border-t border-slate-300 dark:border-gray-400/30 mt-1 font-bold hover:cursor-pointer hover:text-slate-700 dark:hover:text-slate-400"
          onClick={() => setChatType(ChatType.VOTES)}
        >
          View Votes
        </div>
      </div>
    );
}
