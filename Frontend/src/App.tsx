import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Applayout from "./layout/Applayout";
import Room from "./pages/Room";
import ShowsDisplay from "./pages/ShowsDisplay";
import toast, { Toaster } from "react-hot-toast";
import { useRecoilState, useRecoilValue } from "recoil";
import { userInfo } from "./State/userState";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { FriendRequests } from "./State/FriendRequests";


const socket = io("http://localhost:3000/", { autoConnect: true });
export default function App() {
const [Requests, setFriendRequests] = useRecoilState(FriendRequests);

 
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


 },[Requests])
  useEffect(() => {
    

    // socket.connect();
    socket.emit("register", userId);
    socket.on("user-not-found", () => {
      toast.error("User does not exist");
    });

    socket.on("load-noti", (noti)=>{setFriendRequests(noti)})


    //@ts-ignore
    const handleLoadFriends = (actualFriends) => {
        console.log(actualFriends);
    };

    socket.on("load-friends", handleLoadFriends);

    // Clean up on unmount
    return () => {
        socket.off("load-friends", handleLoadFriends);
        socket.off("user-not-found");
      
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
