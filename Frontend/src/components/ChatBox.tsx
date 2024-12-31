import { useEffect, useRef } from "react";
import Chats from "./Chats";
import Polls from "./Polls";
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


export default function ChatBox({ messages }: { messages: Message[] }) {
  // Create a reference for the scrollable container
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Scroll to the bottom when the messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]); // This effect runs whenever messages change

  return (
    <div>
      {/* Chats section */}
      <div
        ref={chatContainerRef}
        className="flex flex-col w-full justify-start items-start p-2 space-y-1.5 overflow-y-auto h-64 md:h-[35rem] scrollbar-thin  scrollbar-track-yellow-600 "
      >
        {messages.map((message, index) =>
         message.type === "normal" ? <Chats key={index} chat={message} /> : <Polls key={index} poll={message}/>
)}

      </div>
    </div>
  );
}