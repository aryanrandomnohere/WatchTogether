import { atom } from "recoil";

interface UserInfoType {
    id:string,
    username:string,
    email:string,
    displayname:string,
}

export const userInfo = atom<UserInfoType>({
   key:"userInfo",
   default: {
    id:"",
    username:"",
    email:"",
    displayname:"",
   }
})
