import { atom} from "recoil";


export const isAuthenticatedState = atom<boolean>({
  key: "isAuthenticatedState",
  default: Boolean("h"), // Initialize based on token presence
});