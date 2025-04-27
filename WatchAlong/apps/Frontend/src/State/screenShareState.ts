import { atom } from "recoil";

interface screenShareType {
    screenShare: boolean;
    screenSharerId: string | undefined;
  }

  export const screenShareState = atom<screenShareType>({
    key: 'screenShareState',
    default: {
      screenShare: false,
      screenSharerId: undefined,
    },
  });