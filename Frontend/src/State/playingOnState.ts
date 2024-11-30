import { atom } from "recoil";

export const nowPlaying = atom<number|null>({
key:"nowPlaying",
default:null,
})
export const wasPlaying = atom<string>({
    key:"wasPlaying",
    default:""
})



