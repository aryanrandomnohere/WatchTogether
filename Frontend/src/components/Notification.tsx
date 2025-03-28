import Avatar from "./Avatar";
import RequestActions from "./RequestActions";

interface requests {
  from: string;
  fromUsername: string;
} 

export default function Notification({ request }: { request: requests }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <Avatar r="req" name={request.fromUsername} />
        <div className="flex flex-col">
          <h1 className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {request.fromUsername}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            sent you a friend request
          </p>
        </div>
      </div>
      <div className="flex-shrink-0">
        <RequestActions fromUsername={request.fromUsername} id={request.from} />
      </div>
    </div>
  );
}
