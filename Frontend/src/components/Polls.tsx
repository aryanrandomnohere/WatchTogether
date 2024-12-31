import Option from "./Option";
import { TiTick } from "react-icons/ti";

interface Message {
  id: number;
  type:string;
  displayname: string;
  edited: boolean;
  multipleVotes: boolean;
  time: string;
  message: string;
  options?: Option[]; 
  replyTo?: Reply | null; 
}

interface Option {
  chatId:number;
  option: string;
  id: number;
  votes?: Vote[]|null; 
}

  interface Vote {
    chatId:number;
    id: number;
    userId:string;
    optionId: number;
    user: User;
  }
  interface Reply {
    id: number;
    displayname: string;
    edited: boolean;
    time: string;
    message: string;
  }

interface User {
    id: string;
    displayname: string;
    username: string; 
  }

export default function Polls({poll}:{poll:Message}) {
  const totalVotes = poll.options?.reduce((ac,op)=>{
    return ac += op?.votes?.length || 0;
  },0) || 0;
 if(poll.options) return (
    <div className="flex flex-col p-2 pl-4 rounded  border border-stone-800 w-full  justify-center bg-slate-800 bg-opacity-50"><div className="text-sm text-yellow-600 font-bold">{poll.displayname}</div>
    <div className="font-bold flex flex-col gap-1 text-white mt-1   ">{poll.message}</div>
    {poll.multipleVotes ? <div className="flex items-center text-xs  mt-1"><TiTick className="rounded-full text-white bg-yellow-600"/><TiTick className="rounded-full text-white bg-yellow-600 mr-1" /> Select one or more</div>: <div className="text-xs flex mt-1 items-center "><TiTick className="rounded-full text-white bg-yellow-600 mr-1" />Select one</div>}
    <div className="mt-2">{poll.options.map((option)=>(<Option key={option.id} option={option} totalVotes={totalVotes}/>))}</div>
    <div className="text-xs flex justify-end mt-1">{poll.time}</div>
    <div className="flex w-full justify-center pt-2 border-t border-t-gray-400/30 mt-1 font-bold hover:cursor-pointer">View Votes</div>
    </div>
  )
}
