import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Applayout from "./layout/Applayout";
import Room from "./pages/Room";
import ShowsDisplay from "./pages/ShowsDisplay";
import toast, { Toaster } from "react-hot-toast";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { userInfo } from "./State/userState";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { FriendRequests } from "./State/FriendRequests";
import { Friends } from "./State/friendsState";


const socket = io("http://192.168.0.106:5000", { autoConnect: true });
export default function App() {
const setFriendRequests = useSetRecoilState(FriendRequests);
const setFriends = useSetRecoilState(Friends);
 const userInfoState = useRecoilValue(userInfo);
 const userId = userInfoState.id;
 useEffect(()=>{
  socket.on("receive-friend-request", ({senderId, senderUsername}) => {
    console.log(senderUsername, senderId);
    setFriendRequests((requests)=>[...requests, {fromUsername:senderUsername, from:senderId}])
    toast(`${senderUsername} sent you a friend request`,
      {
        icon: '👨‍❤️‍💋‍👨',
        style: {
          borderRadius: '1px',
          background: '#333',
          color: '#fff',
        },
      }
    );
});

return () =>{
  socket.off("receive-friend-request")
}
 },[])

  useEffect(() => {
    

    // socket.connect();
    socket.emit("register", userId);
    socket.on("user-not-found", () => {
      toast.error("User does not exist");
    });

    socket.on("load-noti", (noti)=>{setFriendRequests(noti)})
 

    socket.on("receive-join-request",(from)=>{
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <img
                  className="h-10 w-10 rounded-full"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixqx=6GHAjsWpt9&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.2&w=160&h=160&q=80"
                  alt=""
                />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {from}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                 has requested to join your room
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Close
            </button>
          </div>
        </div>
      ))
    })


    socket.on("receive-invite-request",(from)=>{
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <img
                  className="h-10 w-10 rounded-full"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixqx=6GHAjsWpt9&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.2&w=160&h=160&q=80"
                  alt=""
                />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {from}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                 Sent you room invite
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Close
            </button>
          </div>
        </div>
      ))
    })
    


    socket.on("load-friends",(actualFriends) => {
      setFriends(actualFriends);
  });
  socket.on("receive-friend",(newFriend)=>{
    setFriends((friend)=>[...friend, newFriend])
  })

    // Clean up on unmount
    return () => {
        socket.off("load-friends");
        socket.off("user-not-found");
        socket.off("load-noti") ;
        socket.off("receive-friend");
        socket.off("receive-invite-request");
        socket.off("receive-join-request");
        // socket.disconnect();
    };
}, [userId]); // Add dependencies here to handle changes in socket or userId


  return (
    <BrowserRouter>
      <>
        <Toaster />
        <Routes>
          <Route path="/" element={<Applayout />}>
            <Route index element={<Home />} />
            <Route path="nowwatching" element={<Room />} />
            <Route path="query/:id" element={<ShowsDisplay />} />
            <Route path="watch/:roomId" element={<Room />} />
          </Route>
        </Routes>
      </>
    </BrowserRouter>
  );
}
