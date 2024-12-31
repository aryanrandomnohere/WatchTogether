import { atom } from "recoil";
interface Message {
  id: number;
  type:string;
  displayname: string;
  edited: boolean;
  multipleVotes: boolean;
  time: string;
  message: string;
  options?: Option[]; 
  replyTo?: Reply | null; 
}

interface Option {
  chatId:number;
  option: string;
  id: number;
  votes?: Vote[]|null; 
}

interface Vote {
  chatId:number;
  userId:string;
  id: number;
  optionId: number;
  user: User;
}

interface User {
  id: string;
  displayname: string;
  username: string; 
}

interface Reply {
  id: number;
  displayname: string;
  edited: boolean;
  time: string;
  message: string;
}
  

const initialState: Message[] = [];

export const roomMessages = atom<Message[]>({
    key:"roomMessages",
    default: initialState,
})