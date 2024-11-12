import { atom } from "recoil";

export const nowPlaying = atom<string>({
key:"nowPlaying",
default:""
})
export const wasPlaying = atom<string>({
    key:"wasPlaying",
    default:""
})



