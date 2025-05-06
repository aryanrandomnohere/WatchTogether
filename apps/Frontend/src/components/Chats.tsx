import { motion } from 'framer-motion';
import { useRecoilValue } from 'recoil';

import { userInfo } from '../State/userState';
import MsgAction from './MsgAction';

export default function Chats({
  chat,
}: {
  chat: { displayname: string; message: string; time: string; id: number };
}) {
  const Info = useRecoilValue(userInfo);
  const isEmojiOnly = (message: string) => {
    // Simple check for emoji-only messages
    // This avoids the complex regex that was causing linter errors
    return message.length <= 4 && /[\u{1F300}-\u{1F9FF}]/u.test(message);
  };

  const isCurrentUser = chat.displayname === Info.displayname;

  return (
    <div className={`w-full flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-1`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`
          ${isCurrentUser
            ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white border-blue-400/30'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'}
          rounded-xl px-3 py-2 max-w-[65%] border shadow flex flex-col gap-0.5
        `}
        style={{ wordBreak: 'break-word' }}
      >
        <div className="flex justify-between items-center mb-0.5">
          <span className={`font-semibold text-[0.85rem] ${isCurrentUser ? 'text-white/80' : 'text-slate-700 dark:text-slate-300'}`}>{chat.displayname}</span>
          <MsgAction chatId={chat.id} message={chat.message} displayname={chat.displayname} />
        </div>
        <div className={`${isEmojiOnly(chat.message) ? 'text-2xl' : 'text-sm'} ${isCurrentUser ? 'text-white' : 'text-slate-800 dark:text-white'} pt-0.5`}>{chat.message}</div>
        <div className={`text-xs font-extralight self-end mt-0.5 ${isCurrentUser ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>{chat.time}</div>
      </motion.div>
    </div>
  );
}
