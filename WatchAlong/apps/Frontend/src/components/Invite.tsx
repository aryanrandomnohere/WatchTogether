import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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
  return (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-slate-200 dark:bg-slate-800 shadow-lg rounded-lg pointer-events-auto flex justify-center items-center ring-1 ring-slate-300 dark:ring-slate-700 ring-opacity-5`}
    >
      <div className="flex-1 items-center w-0 p-2">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">{/* Avatar or image goes here */}</div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{from}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              has requested to join your room
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-slate-300 dark:border-slate-700">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          Cancel
        </button>
      </div>
      <div className="flex border-l border-slate-300 dark:border-slate-700">
        <button
          onClick={() => {
            toast.dismiss(t.id);
            navigate(`/watch/${fromId}`);
          }}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
