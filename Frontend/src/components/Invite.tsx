import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FaUserFriends } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { MdCheck } from 'react-icons/md';

interface ToastType {
  id: string;
  visible: boolean;
}

export default function Invite({
  t,
  from,
  fromId,
}: {
  t: ToastType;
  from: string;
  fromId: string;
}) {
  const navigate = useNavigate();
  
  const handleDismiss = () => {
    // Immediately dismiss the toast
    toast.dismiss(t.id);
  };
  
  const handleJoin = () => {
    // Immediately dismiss the toast
    toast.dismiss(t.id);
    // Navigate after a very short delay to ensure toast is dismissed
    setTimeout(() => {
      navigate(`/watch/${fromId}`);
    }, 50);
  };
  
  return (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-sm w-full bg-slate-200 dark:bg-slate-800 shadow-lg rounded-lg pointer-events-auto overflow-hidden`}
    >
      <div className="p-3 flex items-center">
        <div className="flex-shrink-0 bg-slate-300 dark:bg-slate-700 rounded-full p-1.5">
          <FaUserFriends className="text-slate-600 dark:text-slate-300 text-sm" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{from}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            wants to watch with you
          </p>
        </div>
      </div>
      
      <div className="flex border-t border-slate-300 dark:border-slate-700">
        <button
          onClick={handleDismiss}
          className="flex-1 py-2 px-3 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors duration-150"
        >
          <IoClose className="mr-1 text-sm" />
          Later
        </button>
        <button
          onClick={handleJoin}
          className="flex-1 py-2 px-3 flex items-center justify-center text-xs font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors duration-150"
        >
          <MdCheck className="mr-1 text-sm" />
          Join
        </button>
      </div>
    </div>
  );
}
