import { useState } from 'react';
import { BsPeopleFill } from 'react-icons/bs';
import { FaArrowsTurnRight } from 'react-icons/fa6';
import { MdArrowForwardIos } from 'react-icons/md';
import { Link } from 'react-router-dom';

import { useRecoilValue } from 'recoil';

import { userInfo } from '../State/userState';
import AddFriend from '../components/AddFriend';
import AllFriends from '../components/AllFriends';
import Notifications from '../components/Notifications';
import UserDisplay from '../components/UserDisplay';

export default function SideBar() {
  const Info = useRecoilValue(userInfo);
  const [fOpen, setfOpen] = useState(false);

  return (
    <div className="flex flex-col justify-between min-h-screen h-full w-full  bg-slate-200 dark:bg-slate-900">
      {/* Header with user room link */}
      <div className="flex-none p-3 border-b border-slate-300 dark:border-slate-700">
        <Link
          to={`/watch/${Info.id || 'guest'}`}
          className="flex items-center justify-between px-4 py-2 rounded-lg bg-slate-300 dark:bg-slate-800 hover:bg-slate-400 dark:hover:bg-slate-700 transition-colors duration-200"
        >
          <span className="font-medium text-slate-800 dark:text-slate-200">Your Room</span>
          <FaArrowsTurnRight className="text-slate-600 dark:text-slate-400" />
        </Link>
      </div>

      {/* Main navigation - scrollable area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-2">
          {/* Friends section */}
          <div className="space-y-2">
            <button
              onClick={() => setfOpen(!fOpen)}
              className="flex items-center justify-between w-full px-4 py-2 text-left rounded-lg hover:bg-slate-300 dark:hover:bg-slate-800 transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <BsPeopleFill className="text-slate-600 dark:text-slate-400" />
                <span className="font-medium text-slate-800 dark:text-slate-200">Friends</span>
              </div>
              <MdArrowForwardIos
                className={`text-sm text-slate-600 dark:text-slate-400 transition-transform duration-200 ${fOpen ? 'rotate-90' : ''}`}
              />
            </button>

            {/* Friends content */}
            <div className={`space-y-2  ${fOpen ? 'block' : 'hidden'}`}>
              <AllFriends />
              <AddFriend />
            </div>
          </div>

          {/* Notifications */}
          <div className="px-4">
            <Notifications />
          </div>
        </div>
      </div>

      {/* User profile section - fixed at bottom */}
      <div className=" p-3 border-t border-slate-300 mb-14 dark:border-slate-700 bg-slate-200 dark:bg-slate-900">
        <UserDisplay />
      </div>
    </div>
  );
}
