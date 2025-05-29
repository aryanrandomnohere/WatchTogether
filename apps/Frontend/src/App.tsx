import { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Route, Routes, useNavigate } from 'react-router-dom';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { FriendRequests } from './State/FriendRequests';
import { isAuthenticatedState } from './State/authState';
import { Friends } from './State/friendsState';
import { userInfo } from './State/userState';
import Invite from './components/Invite';
import Applayout from './layout/Applayout';
import Home from './pages/Home';
import Room from './pages/Room';
import ShowsDisplay from './pages/ShowsDisplay';
import getSocket from './services/getSocket';

interface Friend {
  id: string;
  status: string;
  displayname: string;
  username: string;
}

const socket = getSocket();

export default function App() {
  const setFriendRequests = useSetRecoilState(FriendRequests);
  const [friends, setFriends] = useRecoilState(Friends);
  const isAuthenticated = useRecoilValue(isAuthenticatedState);
  const userInfoState = useRecoilValue(userInfo);
  const userId = userInfoState.id;
  const navigate = useNavigate();
  // Apply theme to document

  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    socket.emit('register', userId);
    return ()=>{
      socket.off('register' )
    }
  }, [userId]);

  useEffect(() => {
    if (!isAuthenticated) return;
    socket.connect();

    socket.on('user-not-found', () => {
      toast.error('User does not exist');
    });
    socket.on('receive-join-request', (from: string, fromId: string) => {
      toast.custom(t => <Invite from={from} fromId={fromId} t={t} />);
    });

    socket.on('receive-invite-request', (from: string, fromId: string) => {
      toast.custom(t => <Invite t={t} from={from} fromId={fromId} />);
    });

    socket.on('receive-friend', (newFriend: Friend) => {
      setFriends(friend => [...friend, newFriend]);
    });
    function handleReceiveFreq({
      senderId,
      senderUsername,
    }: {
      senderId: string;
      senderUsername: string;
    }) {
      setFriendRequests(requests => [
        ...requests,
        { fromUsername: senderUsername, from: senderId },
      ]);
      toast(`${senderUsername} sent you a friend request`, {
        icon: '',
        style: {
          borderRadius: '1px',
          background: '#333',
          color: '#fff',
        },
      });
    }

    function handleFriendStatuUpdate({ userId, newStatus }: { userId: string; newStatus: string }) {
      const updatedStatusFriend = friends.map(f => {
        if (f.id === userId) {
          return { ...f, status: newStatus };
        }
        return { ...f };
      });
      setFriends(updatedStatusFriend);
    }

    socket.on('receive-friend-request', handleReceiveFreq);
    socket.on('friend-status-update', handleFriendStatuUpdate);

    // Clean up on unmount
    return () => {
      socket.off('receive-friend-request');
      socket.off('friend-status-update', handleFriendStatuUpdate);
      socket.off('user-not-found');
      socket.off('receive-friend');
      socket.off('receive-invite-request');
      socket.off('receive-join-request');
    };
  }, [userId, navigate, friends, setFriendRequests, setFriends]);

  return (
    <Applayout>
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nowwatching" element={<Room />} />
        <Route path="/query/:id" element={<ShowsDisplay />} />
        <Route path="/watch/:roomId" element={<Room />} />
      </Routes>
    </Applayout>
  );
}
