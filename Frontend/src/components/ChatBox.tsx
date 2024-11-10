import { useEffect, useRef } from "react";
import Chats from "./Chats";

interface Message {
  name: string;
  time: string;
  message: string;
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
        className="flex flex-col justify-start items-start p-4 space-y-2 overflow-y-auto h-52 md:h-[35rem] "
      >
        {messages.map((message, index) => (
          <Chats key={index} chat={message} />
        ))}
      </div>
    </div>
  );
}
