import { useEffect, useState } from 'react';
import { SlOptions } from 'react-icons/sl';
import { useParams } from 'react-router-dom';

import { useRecoilState, useSetRecoilState } from 'recoil';

import { replyingToState } from '../State/replyingToState';
import { roomMessages } from '../State/roomChatState';
import { useOutsideClick } from '../hooks/useOutsideClick';
import getSocket from '../services/getSocket';
import Actions from './Actions';

const socket = getSocket();

export default function MsgAction({
  chatId,
  message,
  displayname,
}: {
  chatId: number;
  message: string;
  displayname: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useRecoilState(roomMessages);
  const setReplyTo = useSetRecoilState(replyingToState);
  const ref = useOutsideClick(handleOutsideClick);
  const { roomId } = useParams();
  useEffect(() => {
    socket.on('receive-deleteMessage', (id: number) => {
      const newMessage = messages.filter(msg => msg.id !== id);
      setMessages(newMessage);
    });
  }, []);

  function handleDeleteChat() {
    const newMessage = messages.filter(msg => msg.id !== chatId);
    setMessages(newMessage);
    console.log(roomId, chatId);

    socket.emit('deleteMessage', { roomId, chatId });
    setIsOpen(false);
  }

  function handleReplyTo() {
    setReplyTo({
      displayname,
      chatId,
      message,
    });
    setIsOpen(false);
  }
  function handleOutsideClick() {
    setIsOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <SlOptions
        onClick={() => setIsOpen(!isOpen)}
        className="hover:cursor-pointer hover:text-slate-700 dark:hover:text-slate-400"
      />
      <div
        className={`absolute right-0 h-fit bg-slate-200 dark:bg-slate-950 w-fit opacity-0 transform rounded-md text-slate-800 dark:text-white border border-slate-300 dark:border-slate-400/20 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-90 translate-y-0' : ''}`}
      >
        <div className="flex flex-col p-1 px-3 gap-2 h-full">
          <Actions>
            <div className="text-sm" onClick={handleReplyTo}>
              reply
            </div>
          </Actions>
          <Actions>
            <div className="text-sm" onClick={handleDeleteChat}>
              Delete
            </div>
          </Actions>
        </div>
      </div>
    </div>
  );
}
