import { atom } from "recoil";

interface screenShareType {
    status: boolean;
    screenSharerId: string | undefined;
  }

  export const screenShareState = atom<screenShareType>({
    key: 'screenShareState',
    default: {
      status: false,
      screenSharerId: undefined,
    },
  });