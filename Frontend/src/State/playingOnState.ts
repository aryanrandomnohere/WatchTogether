import { atom } from "recoil";

interface nowPlayingType {
    id:number | string;
    title: string | undefined;
    type:string;
    animeId?: string;
}


export const nowPlaying = atom<nowPlayingType|null>({
key:"nowPlaying",
default:null,
})
export const wasPlaying = atom<nowPlayingType|null>({
    key:"wasPlaying",
    default: null,
})

export const controlledPlaying =atom<nowPlayingType>({
    key:"inputPlaying",
    default:{id:"",title:"",type:""}
})

export const finalPlaying = atom<nowPlayingType>({
    key:"finalPlaying",
    default:{id:"",title:"",type:""}
})


