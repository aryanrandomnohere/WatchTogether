import { atom } from "recoil";

interface Friend {
    id:string;
    status:string;
    firstname:string;
    lastname:string;
    username:string
}
export const Friends = atom<Friend[] | undefined>({
    key :"Friends",
    default: undefined
})