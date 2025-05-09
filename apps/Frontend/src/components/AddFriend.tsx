import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { MdOutlinePersonAddAlt } from 'react-icons/md';

import { useRecoilValue } from 'recoil';

import { userInfo } from '../State/userState';
import getSocket from '../services/getSocket';

const socket = getSocket();

export default function AddFriend() {
  const User = useRecoilValue(userInfo);
  const [fusername, setfusername] = useState('');

  function sendRequest(e: FormEvent) {
    e.preventDefault();
    if (!fusername.trim()) {
      toast.error('Please enter a username.');
      return;
    }

    socket.emit('send-friend-request', User.id, User.username, fusername);

    // After emitting the request, reset the username input
    setfusername('');

    // Assuming the event will be handled by server for success or failure feedback
    // toast.success("Friend request sent.");
  }

  return (
    <div className="flex flex-col justify-center min-w-full">
      <form className="flex items-center" onSubmit={sendRequest}>
        <input
          onChange={e => setfusername(e.target.value)}
          value={fusername}
          className="relative bg-slate-950  bg-opacity-5 rounded-md py-1 px-2 w-full font-bold mt-2 border text-center self-center focus:outline-none focus:placeholder-transparent focus:border-slate-400 "
          placeholder="Find Friend"
        />
        <button className=" absolute right-3 p-1 mt-2 px-2  text-xl border-l text-slate-400">
          <MdOutlinePersonAddAlt />
        </button>
      </form>
    </div>
  );
}
