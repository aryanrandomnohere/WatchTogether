import { MdUnfoldMore } from "react-icons/md";
import Avatar from "./Avatar";
import { userInfo } from "../State/userState";
import { useRecoilValue } from "recoil";
import { useState } from "react";
import UserActions from "./UserActions";
import { useOutsideClick } from "../hooks/useOutsideClick";

export default function UserDisplay() {
    const user = useRecoilValue(userInfo)
    const [isOpen, setIsOpen] = useState(false);
    const handleCloseModal =  () => {
     setIsOpen(false)
    }
    const ref = useOutsideClick(handleCloseModal)
    return (
        <div 
            onClick={() => setIsOpen(true)} 
            className="ml-2 relative border border-slate-700 shadow-black  shadow-md flex gap-2 items-center justify-center py-2 px-3  mb-14 mt-auto rounded-lg hover:bg-black  hover:bg-opacity-40 hover:cursor-pointer"
        >
            <Avatar r="user" name={user.username} />
            <div className="flex justify-between items-center w-full mt-1">
                <div className="flex flex-col justify-center">
                    <h1 className="text-lg font-bold text-slate-400">{user.username}</h1>
                    <h5 className="font-extralight text-sm text-white">{user.email}</h5>
                </div>
                <MdUnfoldMore className="text-xl text-white font-bold" />
            </div>
            
            {isOpen && (
                <div ref={ref} className="absolute left-0 bottom-full ">
                    <UserActions  />
                </div>
            )}
        </div>
    );
}
