import toast from 'react-hot-toast';
import { IoMdCheckmark } from 'react-icons/io';
import { RxCross2 } from 'react-icons/rx';

import axios from 'axios';
import { useRecoilState, useRecoilValue } from 'recoil';

import { FriendRequests } from '../State/FriendRequests';
import { userInfo } from '../State/userState';
import getSocket from '../services/getSocket';

const socket = getSocket();
export default function RequestActions({ id, fromUsername }: { id: string; fromUsername: string }) {
  const [requests, setFriendRequests] = useRecoilState(FriendRequests);
  const UserInfo = useRecoilValue(userInfo);

  async function handleRejection() {
    try {
      await axios.put(
        //@ts-ignore
        `${import.meta.env.VITE_BACKEND_APP_API_BASE_URL}/api/v1/social/rejectrequest`,
        { from: id },
        {
          headers: {
            authorization: localStorage.getItem('token'),
          },
        }
      );

      const afterDeletion = requests.filter(req => req.fromUsername !== fromUsername); // Fixed line
      setFriendRequests(afterDeletion);
      toast.success('Request Rejected');
    } catch (error) {
      console.error('Error rejecting the friend request:', error);
    }
  }
  async function handleAcceptance() {
    console.log(UserInfo.id);

    const acceptdata = {
      userId: UserInfo.id,
      friendId: id,
    };

    socket.emit('accept-friend-request', acceptdata);
    const afterDeletion = requests.filter(req => req.fromUsername !== fromUsername); // Fixed line
    await axios.put(
      //@ts-ignore
      `${import.meta.env.VITE_BACKEND_APP_API_BASE_URL}/api/v1/social/rejectrequest`,
      { from: id },
      {
        headers: {
          authorization: localStorage.getItem('token'),
        },
      }
    );
    setFriendRequests(afterDeletion);
    toast.success('Friend Request Accepted');
  }

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={handleRejection}
        className="p-1.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-200"
      >
        <RxCross2 className="text-lg" />
      </button>
      <button 
        onClick={handleAcceptance}
        className="p-1.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors duration-200"
      >
        <IoMdCheckmark className="text-lg" />
      </button>
    </div>
  );
}
