import { BrowserRouter, Route, Routes } from "react-router-dom";
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
const [Requests, setFriendRequests] = useRecoilState(FriendRequests);
const setFriends = useSetRecoilState(Friends);
 const userInfoState = useRecoilValue(userInfo);
 const userId = userInfoState.id;
 useEffect(()=>{
  socket.on("receive-friend-request", ({senderId, senderUsername}) => {
    console.log(senderUsername, senderId);
    setFriendRequests([...Requests, {fromUsername:senderUsername, from:senderId}])
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
 

    //@ts-ignore
  

    socket.on("load-friends",(actualFriends) => {
      setFriends(actualFriends);
  });

    // Clean up on unmount
    return () => {
        socket.off("load-friends");
        socket.off("user-not-found");
        socket.off("load-noti")
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
