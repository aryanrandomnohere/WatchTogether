import { atom } from 'recoil';

export const epState = atom({
  key: 'epState',
  default: {
    season_number: 1,
    episode_number: 1,
  },
});
