import { atom } from "recoil";
interface requests {
    from:string;
    fromUsername:string;
} 
export const FriendRequests = atom<requests[]>({
    key:"All Requests",
    default: []
})