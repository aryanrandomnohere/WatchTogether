import { useEffect, useRef } from "react";
import Chats from "./Chats";
import Polls from "./Polls";
import ReplyTo from "./ReplyTo";

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

export default function ChatBox({ messages }: { messages: Message[] }) {
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    // Check if user is near the bottom before auto-scrolling
    const isAtBottom =
      chatContainer.scrollHeight - chatContainer.clientHeight <= chatContainer.scrollTop + 50;

    if (isAtBottom) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]); // Run only when messages update

  useEffect(()=>{
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }

  },[messages])

  return (
    <div>
      <div
        ref={chatContainerRef}
        className="flex flex-col w-full justify-start  items-start max-h-64 sm:max-h-full px-2 space-y-2.5 overflow-y-auto h-full md:h-[37rem] md:min-h-[32rem] scrollbar-thin scrollbar-track-yellow-600"
      >
        {messages.map((message, index) =>
          message.type === "normal" ? (
            <Chats key={message.id} chat={message} /> 
          ) : message.type === "poll" ? (
            <Polls key={message.id} poll={message} /> 
          ) : (
            <ReplyTo key={message.id} replyTo={message} />
          )
        )}
      </div>
    </div>
  );
}
