import { useParams } from "react-router-dom";
import { userInfo } from "../State/userState";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { toast } from "react-hot-toast";
import {  LuMinusCircle, LuPlusCircle } from "react-icons/lu";
import { BsSendFill } from "react-icons/bs";
import { useState } from "react";
import { io } from "socket.io-client";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { chatType } from "../State/chatWindowState";
const socket = io(`${import.meta.env.VITE_BACKEND_APP_API_BASE_URL}`); 

enum ChatType {
    CHATS,
    POLL,
    VOTES,
}

export default function PollWindow() {
    const [question, setQuestion] = useState<string>("");
    const [options, setOptions] = useState<string[]>(["", ""]);
    const [allow, setAllow]= useState<boolean>(false)
    const {roomId} = useParams()
    const Info = useRecoilValue(userInfo)
    const setChatType = useSetRecoilState(chatType)
    const handleSendPoll = (e: React.FormEvent) => {
      e.preventDefault();
      const currentTime = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
      // Validate question and options
      if (!question.trim()) {
        toast.error("Question is required!");
        return;
      }
  
      if (options.length < 2 || options[0].trim() === "" || options[1].trim() === "") {
        toast.error("At least two non-empty options are required!");
        return;
      }
  
      // Emit poll to server
      console.log({roomId,type:"poll",options,multipleVotes:allow, message: question,time:currentTime,displayname: Info.displayname || Info.username, });
    socket.emit("send-message", {roomId,type:"poll",options,multipleVotes:allow, message:question ,time:currentTime,displayname: Info.displayname || Info.username, });
      toast.success("Poll sent successfully!");
  
      // Reset state
      setQuestion("");
      setOptions(["", ""]);
      setChatType(ChatType.CHATS)

    };
  
    const addOption = () => {
      if(options.length>3) return
      setOptions([...options, ""]);
    };

     function goBack() {
       setChatType(ChatType.CHATS)
     }

    return <div className=" border border-t-0 border-yellow-600/20  justify-between h-64 md:h-[38rem]  mt-2"><div className="mx-3 mb-10 hover:cursor-pointer max-w-72" onClick={goBack}><IoArrowBackCircleSharp className="text-3xl hover:text-yellow-600" /></div> <form onSubmit={handleSendPoll} className="flex flex-col my-2 md:my-9 justify-between h-full mx-7 w-76 lg:w-96 gap-2">
    <div className="w-full h-full flex flex-col max-w-72 mt-12 "><div className="w-full"><h1 className="text-yellow-600 font-bold">Question</h1>
    <input
      value={question}
      onChange={(e) => setQuestion(e.target.value)}
      className="bg-transparent border-b max-w-72 ml-1 p-1 w-full focus:border-yellow-600 focus:outline-none"
      placeholder="Ask question"
      required
    /></div>
    <div className="flex flex-col mt-2.5 sm:mt-6 gap-2">
      <h1 className="text-yellow-600 font-bold">Options</h1>
      {options.map((option, index) => (
        <input
          key={index}
          value={option}
          onChange={(e) => {
            const newOptions = [...options];
            newOptions[index] = e.target.value;
            setOptions(newOptions);
          }}
          className="bg-transparent border-b max-w-72 ml-1 p-1 focus:border-yellow-600 focus:outline-none"
          placeholder={`Option ${index + 1}`}
  
        />
      ))}
      <div className="w-full flex justify-between text-xl text-yellow-600 items-center  ">
  <div className="flex justify-center items-center hover:cursor-pointer  hover:text-yellow-900 max-w-72" onClick={() => {
  if (options.length <= 2) return;
  const newOptions = [...options]; // Clone the array
  newOptions.pop(); // Remove last option
  setOptions(newOptions); // Update the state with the new array
  }}>
  <LuMinusCircle />...
  </div>
  <div className="flex justify-center items-center hover:cursor-pointer hover:text-yellow-900 max-w-72" onClick={addOption}>
  ...<LuPlusCircle />
  </div>
  </div>
  
    </div><div>
    <div className="flex justify-between w-full ml-1 mt-3">
      <p>Allow multiple answers</p>
      <input type="checkbox" checked={allow}  onChange={(e) => setAllow(e.target.checked)} />
    </div></div></div>
    <div className="flex w-full justify-end mt-4 mb-28 max-w-72">
      <button
        type="submit"
        className="p-2 border border-yellow-600 rounded bg-yellow-600 text-white"
      >
        <BsSendFill />
      </button></div>
    
  </form></div> 
  }