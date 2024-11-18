import Avatar from "./Avatar";

interface message {
    senderUsername: string;
    senderUserId:string
}
export default function Notification({msg}: {msg:message}) {
  return (
   <div className="flex"><Avatar name={msg.senderUsername} r="user"/> <div className="flex flex-cols"><div className="flex"><h1>{msg.senderUsername}</h1></div><div className="font-extralight">sent you a friend request</div></div></div>
  )
}
