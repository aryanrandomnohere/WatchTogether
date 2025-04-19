import Avatar from './Avatar';
import RequestActions from './RequestActions';

interface requests {
  from: string;
  fromUsername: string;
}

export default function Notification({ request }: { request: requests }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar r="req" name={request.fromUsername} />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {request.fromUsername}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">sent you a friend request</p>
        </div>
      </div>
      <div className="flex-shrink-0">
        <RequestActions fromUsername={request.fromUsername} id={request.from} />
      </div>
    </div>
  );
}
