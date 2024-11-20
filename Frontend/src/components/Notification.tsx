import Avatar from "./Avatar";
import RequestActions from "./RequestActions";
interface requests {
  from:string;
  fromUsername:string;
} 
export default function Notification({request}:{request:requests}) {
 

  return (
    <div className="text-white py-1.5 px-3 rounded-md hover:bg-slate-600 hover:bg-opacity-10">
      <div><div className="flex items-center justify-between gap-3">
        <div className="flex gap-2"><Avatar r="req" name={request.fromUsername} /><div className="flex flex-col font-bold gap-0 justify-center items-start">
          <h1 className="hover:text-blue-800 hover:cursor-pointer">{request.fromUsername}</h1><p className="font-extralight text-sm">sent you a friend request</p></div></div><div><RequestActions fromUsername={request.fromUsername} id={request.from} /></div></div>
          </div></div>
  )
}
