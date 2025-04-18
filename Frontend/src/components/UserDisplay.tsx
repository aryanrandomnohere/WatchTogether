import { useState } from 'react';
import { MdUnfoldMore } from 'react-icons/md';

import { useRecoilValue } from 'recoil';

import { userInfo } from '../State/userState';
import { useOutsideClick } from '../hooks/useOutsideClick';
import Avatar from './Avatar';
import UserActions from './UserActions';

export default function UserDisplay() {
  const user = useRecoilValue(userInfo);
  const [isOpen, setIsOpen] = useState(false);
  const handleCloseModal = () => {
    setIsOpen(false);
  };
  const ref = useOutsideClick(handleCloseModal);

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-800 transition-colors duration-200 cursor-pointer"
      >
        <Avatar r="user" name={user.username} />
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
            {user.username}
          </h1>
          <h5 className="text-xs text-slate-600 dark:text-slate-400 truncate">{user.email}</h5>
        </div>
        <MdUnfoldMore className="text-slate-500 dark:text-slate-400 flex-shrink-0" />
      </div>

      {isOpen && (
        <div
          ref={ref}
          className="absolute left-0 bottom-full mb-2 w-full bg-slate-200 dark:bg-slate-800 rounded-lg shadow-lg border border-slate-300 dark:border-slate-700 z-50"
        >
          <UserActions />
        </div>
      )}
    </div>
  );
}
