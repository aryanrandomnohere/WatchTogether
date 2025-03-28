import { useState } from "react";
import Notification from "./Notification";
import { useRecoilValue } from "recoil";
import { FriendRequests } from "../State/FriendRequests";
import { BsBellFill } from "react-icons/bs";

export default function Notifications() {
  const [isOpen, setIsOpen] = useState(false);
  const FriendRequestValue = useRecoilValue(FriendRequests);

  if (!FriendRequestValue || FriendRequestValue.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-left rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <BsBellFill className="text-slate-500 dark:text-slate-400" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              {FriendRequestValue.length}
            </span>
          </div>
          <span className="font-medium text-slate-700 dark:text-slate-200">
            Friend Requests
          </span>
        </div>
      </button>
      
      {isOpen && (
        <div className="space-y-2 pl-11">
          {FriendRequestValue.map((req, index) => (
            <Notification key={index} request={req} />
          ))}
        </div>
      )}
    </div>
  );
}
