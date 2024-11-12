import { atom } from "recoil";
import { io } from "socket.io-client";

export const socketAtom = atom({
    key:"socketAtom",
    default: io("http://localhost:3000/", { autoConnect: false }),
})