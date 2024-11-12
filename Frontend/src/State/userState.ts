import { atom } from "recoil";

interface UserInfoType {
    id:string,
    username:string,
    email:string,
    firsname:string,
    lastname:string,
}

export const userInfo = atom<UserInfoType>({
   key:"userInfo",
   default: {
    id:"",
    username:"",
    email:"",
    firsname:"",
    lastname:"",
   }
})
