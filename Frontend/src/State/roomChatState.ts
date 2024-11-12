import { atom } from "recoil";


interface Message {
    name: string;
    time: string;
    message: string;
}
const initialState: Message[] = [];

export const roomMessages = atom<Message[]>({
    key:"roomMessages",
    default: initialState,
})