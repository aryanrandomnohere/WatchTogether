import { atom } from "recoil";


enum ssType {
  P2P,
  SERVER
}
interface screenShareType {
  status: boolean;
  screenSharerId: string | undefined;
  type:ssType | null
}
  export const screenShareState = atom<screenShareType>({
    key: 'screenShareState',
    default: {
      status: false,
      screenSharerId: undefined,
      type: null
    },
  });