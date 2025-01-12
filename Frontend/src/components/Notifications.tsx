import { useState } from "react";
import Notification from "./Notification";
import { useRecoilValue } from "recoil";
import { FriendRequests } from "../State/FriendRequests";

export default function Notifications() {
  const [isOpen, setIsOpen] = useState(false);
  const FriendRequestValue = useRecoilValue(FriendRequests);

  if (!FriendRequestValue || FriendRequestValue.length === 0) {
    return <div></div>;
  }

  return (
    <div>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="hover:cursor-pointer mt-2 ml-1"
      >
        Friend Requests
      </div>
      {isOpen && (
        <div>
          {FriendRequestValue.map((req, index) => (
            <Notification key={index} request={req} />
          ))}
        </div>
      )}
    </div>
  );
}
