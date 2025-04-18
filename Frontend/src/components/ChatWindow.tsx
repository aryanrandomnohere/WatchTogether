import { useRecoilValue } from 'recoil';

import { chatType } from '../State/chatWindowState';
import AllVotes from './AllVotes';
import FullChat from './FullChat';
import Peoples from './Peoples';
import PollWindow from './PollWindow';

enum ChatType {
  CHATS,
  POLL,
  VOTES,
  PEOPLE,
}
export default function ChatWindow() {
  const Type = useRecoilValue(chatType);
  return (
    <div className=" h-fit min-h-full">
      {Type === ChatType.CHATS ? (
        <FullChat />
      ) : Type === ChatType.POLL ? (
        <PollWindow />
      ) : Type === ChatType.VOTES ? (
        <AllVotes />
      ) : (
        <Peoples />
      )}
    </div>
  );
}
