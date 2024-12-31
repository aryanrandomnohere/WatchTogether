import { atom } from "recoil";
enum ChatType {
    CHATS,
    POLL,
    VOTES,
}
export const chatType = atom<ChatType>({
    key:"chatType",
    default: ChatType.CHATS
})

