import { useEffect, useState } from 'react';
import { BsChatDots } from 'react-icons/bs';
import { FaUsers } from 'react-icons/fa';

import { useRecoilValue, useSetRecoilState } from 'recoil';

import { chatType } from '../State/chatWindowState';
import { people } from '../State/roomPeopleState';
import getSocket from '../services/getSocket';
import Call from './Call';


enum ChatType {
  CHATS,
  POLL,
  VOTES,
  PEOPLE,
}

interface peopleType {
  displayname: string;
  username: string;
  userId: string;
  avatar: '';
}

export default function Chatnav() {
  const setChatType = useSetRecoilState(chatType);
  const currentChatType = useRecoilValue(chatType);
  const socket = getSocket();
  const [connectionCount, setConnectionCount] = useState(0);
  const setRoomPeople = useSetRecoilState(people);
  useEffect(() => {
    socket.on('room-people-data', (data: number, allUser: peopleType[]) => {
      setConnectionCount(data);
      setRoomPeople(allUser);
    });

    return () => {
      socket.off('room-people-data');
    };
  }, []);

  return (
    <div className="flex-none min-h-fit bg-slate-950/80 backdrop-blur-md border-b border-slate-700 shadow-md rounded-t-xl">
      <div className="flex items-center justify-center gap-6 p-1.5">
        <button
          onClick={() => {
            setChatType(ChatType.CHATS)
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
            currentChatType === ChatType.CHATS
              ? 'bg-slate-700/80 text-white'
              : 'text-slate-300 hover:bg-slate-700/50'
          }`}
        >
          <BsChatDots size={16} />
          <span className="text-sm font-medium">Chat</span>
        </button>

        <button
          onClick={() => {
            setChatType(ChatType.PEOPLE)
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
            currentChatType === ChatType.PEOPLE
              ? 'bg-slate-700/80 text-white'
              : 'text-slate-300 hover:bg-slate-700/50'
          }`}
        >
          <div className="relative">
            <FaUsers size={17} />
            {connectionCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center shadow">
                {connectionCount}
              </span>
            )}
          </div>
          <span className="text-sm font-medium">People</span>
        </button>
       
            <Call/>
      </div>
      
    </div>
  );
}
