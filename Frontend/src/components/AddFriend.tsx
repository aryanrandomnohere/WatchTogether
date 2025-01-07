import { FormEvent, useState } from "react";
import { userInfo } from "../State/userState";
import { io } from "socket.io-client";
import { useRecoilValue } from "recoil";
import toast from "react-hot-toast";
import { ImFinder } from "react-icons/im";

const socket = io(`${import.meta.env.VITE_BACKEND_APP_API_BASE_URL}`);

export default function AddFriend() {
  const User = useRecoilValue(userInfo);
  const [fusername, setfusername] = useState("");




  function sendRequest(e:FormEvent) {
    e.preventDefault();
    if (!fusername.trim()) {
      toast.error("Please enter a username.");
      return;
    }

    socket.emit("send-friend-request", User.id, User.username, fusername);

    // After emitting the request, reset the username input
    setfusername("");

    // Assuming the event will be handled by server for success or failure feedback
    // toast.success("Friend request sent.");

  }

  return (
    <div className="flex flex-col justify-center w-full">
    

        <form className="flex items-center" onSubmit={sendRequest}>
          <input
            onChange={(e) => setfusername(e.target.value)}
            value={fusername}
            className="relative bg-black bg-opacity-5 rounded-md py-1 px-2 w-full font-bold mt-2 border text-center self-center focus:outline-none focus:placeholder-transparent focus:border-yellow-600"
            placeholder="Find Friend"
          />
          <button className=" absolute right-3 p-1 mt-2 text-x text-yellow-600"  >
          <ImFinder />
          </button>
        </form>
      
    </div>
  );
}
