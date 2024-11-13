import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Applayout from "./layout/Applayout";
import Room from "./pages/Room";
import ShowsDisplay from "./pages/ShowsDisplay";
import { Toaster } from "react-hot-toast";
import { useRecoilValue } from "recoil";
import { userInfo } from "./State/userState";
import { useEffect } from "react";
import { io } from "socket.io-client";


const socket = io("http://localhost:3000/", { autoConnect: false });
export default function App() {

 
  const userInfoState = useRecoilValue(userInfo);
 const userId = userInfoState.id;
  useEffect(() => {
    

    socket.connect();
    socket.emit("register", userId);

    const handleLoadFriends = (actualFriends) => {
        console.log(actualFriends);
    };

    socket.on("load-friends", handleLoadFriends);

    // Clean up on unmount
    return () => {
        socket.off("load-friends", handleLoadFriends);
        // socket.disconnect();
    };
}, [socket, userId]); // Add dependencies here to handle changes in socket or userId


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
