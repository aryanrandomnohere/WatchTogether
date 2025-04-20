import { useRecoilValue } from 'recoil';
import { motion } from 'framer-motion';

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
    <div className={`w-full ${isCurrentUser ? 'flex justify-end' : 'flex justify-start'}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`${
          isCurrentUser 
            ? 'bg-blue-500 dark:bg-blue-600 text-white' 
            : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
        } rounded-lg px-3 py-2 max-w-[85%] shadow-sm`}
      >
        <div className="flex flex-col h-full justify-between">
          <div className="flex justify-between gap-4 items-center mb-1">
            <div className="flex gap-2 justify-center items-center">
              <h4 className={`font-semibold text-sm ${isCurrentUser ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                {chat.displayname}
              </h4>
            </div>
            <div>
              <MsgAction chatId={chat.id} message={chat.message} displayname={chat.displayname} />
            </div>
          </div>
          <div className="flex flex-col w-full items-start">
            <div
              className={`${isEmojiOnly(chat.message) ? 'text-3xl' : 'text-sm'} ${
                isCurrentUser ? 'text-white' : 'text-slate-800 dark:text-white'
              } pt-1 max-w-full break-words`}
            >
              {chat.message}
            </div>
            <div className={`text-xs font-extralight self-end mt-1 ${
              isCurrentUser ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
            }`}>
              {chat.time}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
