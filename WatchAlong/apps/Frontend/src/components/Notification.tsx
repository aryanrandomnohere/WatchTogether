import { motion } from 'framer-motion';

import Avatar from './Avatar';
import RequestActions from './RequestActions';

interface requests {
  from: string;
  fromUsername: string;
}

export default function Notification({ request }: { request: requests }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-all duration-200">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar r="req" name={request.fromUsername} />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold text-slate-200">
            {request.fromUsername}
          </h1>
          <p className="text-xs text-slate-400">sent you a friend request</p>
        </div>
      </div>
      <div className="flex-shrink-0">
        <RequestActions fromUsername={request.fromUsername} id={request.from} />
      </div>
    </div>
  );
}
