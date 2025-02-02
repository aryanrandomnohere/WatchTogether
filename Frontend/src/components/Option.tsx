import { FaCheckCircle, FaRegCircle } from "react-icons/fa";
import { userInfo } from "../State/userState";
import { useRecoilValue } from "recoil";
import { useParams } from "react-router-dom";
import getSocket from "../services/getSocket";

interface Option {
  chatId: number;
  option: string;
  id: number;
  votes?: Vote[] | null;
}

interface Vote {
  chatId: number;
  userId: string;
  id: number;
  optionId: number;
  user: User;
}

interface User {
  id: string;
  displayname: string;
  username: string;
}

const socket = getSocket()

export default function Option({ option,totalVotes }: { option: Option,totalVotes:number }) {
  const Info = useRecoilValue(userInfo);
  const { roomId } = useParams();

  if (!option || typeof option.id !== "number" || typeof option.chatId !== "number") {
    console.error("Invalid option object:", option);
    return null;
  }

  const isSelected = Array.isArray(option.votes) && option.votes.some((vote) => vote.user.id === Info.id);

  function handleAddVote() {
    if (!roomId) {
      console.error("roomId is undefined");
      return;
    }
console.log({ chatId: option.chatId, optionId: option.id, userId: Info.id, roomId });

    socket.emit("new-vote", { chatId: option.chatId, optionId: option.id, userId: Info.id, roomId })
    
  }

  
  const votesForOption = option.votes?.filter((vote) => vote.optionId === option.id).length || 0; // Votes for this option
  const votePercentage = totalVotes > 0 ? (votesForOption / totalVotes) * 100 : 0;

  return (
    <div className="flex w-full text-white items-center hover:cursor-pointer mt-2">
      <div onClick={handleAddVote}>
        {isSelected ? <FaCheckCircle className="text-xl text-yellow-600" /> : <FaRegCircle className="text-xl text-yellow-600" />}
      </div>
      <div className="flex flex-col justify-center w-full">
        <div className="flex justify-between items-center w-68">
          <label htmlFor={`option-${option.id}`} className="ml-2">
            {option.option}
          </label>
          <div className="text-xs">{votesForOption}</div>
        </div>
       <div className="relative  w-68 h-2 bg-gray-800  rounded-full ml-2"><div className="absolute h-full bg-yellow-100 transition-all duration-700 ease-in-out rounded-full" style={{width:`${votePercentage}%`}}></div></div>
      </div>
    </div>
  );
}
