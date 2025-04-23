import { FormEvent, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { BiSend } from 'react-icons/bi';
import { FaLink } from 'react-icons/fa';
import { GiCancel } from 'react-icons/gi';
import { useParams } from 'react-router-dom';

import axios from 'axios';
import { motion } from 'framer-motion';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { wasPlaying } from '../State/playingOnState';
import { replyingToState } from '../State/replyingToState';
import { roomMessages } from '../State/roomChatState';
import { userInfo } from '../State/userState';
import { useOutsideClick } from '../hooks/useOutsideClick';
import getSocket from '../services/getSocket';
import ChatAction from './ChatAction';
import ChatBox from './ChatBox';

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
  userId: string;
  id: number;
  optionId: number;
  user: User;
}

interface User {
  id: string;
  displayname: string;
  username: string;
}

interface Reply {
  id: number;
  displayname: string;
  message: string;
}

const socket = getSocket();

export default function FullChat() {
  const [chatOptionIsOpen, setChatOptionIsOpen] = useState<boolean>(false);
  const Info = useRecoilValue(userInfo);
  const [messages, setMessages] = useRecoilState(roomMessages);
  const { roomId } = useParams();
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useRecoilState(replyingToState);
  const ref = useOutsideClick(handleClearChatOption);
  const setWasPlaying = useSetRecoilState(wasPlaying);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleLoadState = async () => {
    try {
      //@ts-ignore
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_APP_API_BASE_URL}/api/v1/room/loadstate/${roomId}`,
        {
          headers: { authorization: localStorage.getItem('token') },
        }
      );

      setMessages(response.data.oldMessages); // State updates are async

      const {
        playingId: id,
        playingTitle: title,
        playingType: type,
        playingAnimeId: animeId,
      } = response.data.playing;
      setWasPlaying({ id, title, type, animeId });

      socket.emit('update-status', Info.id, `Watching ${title}`);
    } catch (error) {
      console.error('Error loading state:', error);
    }
  };

  // Message & Poll Handlers
  const handleReceiveMessage = (newMessage: Message) => {
    setMessages(prevMessages => [...prevMessages, newMessage]); // Function-based update
  };

  const handleAddPoll = (newPoll: Message) => {
    setMessages(prevMessages => prevMessages.map(msg => (msg.id === newPoll.id ? newPoll : msg)));
  };

  // Fetch initial data only once
  useEffect(() => {
    handleLoadState();
  }, []);

  // Handle socket events (runs only once)
  useEffect(() => {
    socket.on('receive-message', handleReceiveMessage);
    socket.on('new-poll', handleAddPoll);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('new-poll', handleAddPoll);
    };
  }, []); // Removed `messages` dependency

  function sendMessage(e: FormEvent) {
    e.preventDefault();
    if (!newMessage) {
      toast.error('Empty Input Box');
      return;
    }
    const currentTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (replyTo) {
      socket.emit('send-message', {
        displayname: Info.displayname,
        type: 'replyTo',
        time: currentTime,
        message: newMessage,
        roomId,
        replyTo: replyTo.chatId,
      });
    } else {
      socket.emit('send-message', {
        displayname: Info.displayname,
        type: 'normal',
        time: currentTime,
        message: newMessage,
        roomId: roomId,
      });
    }
    setReplyTo(null);
    setNewMessage('');
  }

  function handleClearReplyTo() {
    setReplyTo(null);
  }

  function handleClearChatOption() {
    setChatOptionIsOpen(false);
  }

  useEffect(() => {
    if (replyTo) {
      inputRef.current?.focus();
    }
  }, [replyTo]);

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="flex-1 min-h-0 relative">
        <ChatBox messages={messages} />
      </div>

      <div
        ref={ref}
        className="relative flex flex-col w-full px-4 py-2 bg-slate-950 backdrop-blur-sm"
      >
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mb-2 bg-slate-800/80 rounded-lg p-5 flex items-center justify-between"
          >
            <div className="flex flex-col  ">
              <span className="text-sm font-medium text-slate-400">
                Replying to {replyTo.displayname}
              </span>
              <span className="text-xs text-slate-500 mt-0.5">{replyTo.message}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClearReplyTo}
              className="text-slate-500 hover:text-slate-400 p-1"
            >
              <GiCancel size={16} />
            </motion.button>
          </motion.div>
        )}

        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={() => setChatOptionIsOpen(state => !state)}
              className=" flex items-center justify-center text-slate-400 hover:text-slate-300 rounded-full hover:bg-slate-700/50"
            >
              <FaLink size={18} />
            </motion.button>

            {chatOptionIsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full left-0 mb-2 w-48 bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden z-50"
              >
                <ChatAction />
              </motion.div>
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-800/80 text-slate-200 placeholder-slate-500 px-4 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="submit"
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full"
          >
            <BiSend size={18} />
          </motion.button>
        </form>
      </div>
    </div>
  );
}
