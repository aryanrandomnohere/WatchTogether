import { atom } from 'recoil';

interface peopleType {
  displayname: string;
  username: string;
  userId: string;
  avatar: '';
}
export const people = atom<peopleType[] | undefined>({
  key: 'people',
  default: [],
});
