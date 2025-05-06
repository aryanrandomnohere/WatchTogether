import { atom } from 'recoil';

interface ReplyToType {
  displayname: string;
  chatId: null | number;
  message: string;
}
export const replyingToState = atom<ReplyToType | null>({
  key: 'replyingTo',
  default: null,
});
