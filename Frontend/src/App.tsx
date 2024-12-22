import {Route, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Applayout from "./layout/Applayout";
import Room from "./pages/Room";
import ShowsDisplay from "./pages/ShowsDisplay";
import toast, { Toaster } from "react-hot-toast";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { userInfo } from "./State/userState";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { FriendRequests } from "./State/FriendRequests";
import { Friends } from "./State/friendsState";



const socket = io("http://192.168.0.106:5000", { autoConnect: true });
export default function App() {
const setFriendRequests = useSetRecoilState(FriendRequests);
const [friends, setFriends] = useRecoilState(Friends);
 const userInfoState = useRecoilValue(userInfo);
 const userId = userInfoState.id;
 const navigate =useNavigate();



  useEffect(() => {
    socket.connect();
    socket.emit("register", userId);
    window.addEventListener("beforeunload", () => {
      socket.emit("update-status",userId, "OFFLINE" );
    });
    
    socket.on("user-not-found", () => {
      toast.error("User does not exist");
    });
    socket.on("receive-join-request",(from, fromId)=>{
      toast.custom((t) => (
        <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-slate-800 shadow-lg rounded-lg pointer-events-auto flex justify-center items-center ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 items-center w-0 p-2">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              {/* Avatar or image goes here */}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-yellow-600">{from}</p>
              <p className="text-sm text-gray-200">
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
            Cancel
          </button>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              navigate(`/watch/${fromId}`);
            }}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Accept
          </button>
        </div>
      </div>
      
      ))
    })


    socket.on("receive-invite-request",(from, fromId)=>{
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-slate-800 shadow-lg rounded-lg pointer-events-auto flex justify-center items-center ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 items-center w-0 p-2">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                {/* <Avatar name={from} r=""/> */}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-yellow-600">
                  {from}
                </p>
                <p className="-scroll-mt-0.5 text-sm text-gray-200">
                 has requested you to join his room
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
          <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
          </div>
          <div className="flex border-l border-gray-200">
          <button
              onClick={() =>{toast.dismiss(t.id);
                navigate(`/watch/${fromId}`);
              }}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Accept
            </button>
          </div>
        </div>
      ))
    })
    


  socket.on("receive-friend",(newFriend)=>{
    setFriends((friend)=>[...friend, newFriend])
  })
  function handleReceiveFreq({senderId, senderUsername}:{senderId:string, senderUsername:string}) {
    setFriendRequests((requests)=>[...requests, {fromUsername:senderUsername, from:senderId}])
    toast(`${senderUsername} sent you a friend request`,
      {
        icon: '',
        style: {
          borderRadius: '1px',
          background: '#333',
          color: '#fff',
        },
      }
    );}
  
    function handleFriendStatuUpdate({userId, newStatus}:{userId:string, newStatus:string}){
      console.log(newStatus);
      
      const updatedStatusFriend = friends.map((f)=>{
        if(f.id === userId){
          return {...f, status:newStatus }
        }
        return {...f}
      })
      setFriends(updatedStatusFriend)
    }
   
  
   
    socket.on("receive-friend-request",handleReceiveFreq);
  socket.on("friend-status-update", handleFriendStatuUpdate)
 

    // Clean up on unmount
    return () => {
    
        socket.off("receive-friend-request")
        socket.off("friend-status-update", handleFriendStatuUpdate)
        socket.off("user-not-found");
        socket.off("receive-friend");
        socket.off("receive-invite-request");
        socket.off("receive-join-request");
        socket.disconnect();
    };
}, [userId,navigate,friends,setFriendRequests,setFriends]); // Add dependencies here to handle changes in socket or userId


  return (
   
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
   
  );
}
