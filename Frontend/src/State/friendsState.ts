import { atom } from 'recoil';

interface Friend {
  id: string;
  status: string;
  displayname: string;
  username: string;
}
export const Friends = atom<Friend[]>({
  key: 'Friends',
  default: [],
});
