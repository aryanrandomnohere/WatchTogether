import { useState } from 'react';
import { BsBellFill } from 'react-icons/bs';
import { motion, AnimatePresence } from 'framer-motion';

import { useRecoilValue } from 'recoil';

import { FriendRequests } from '../State/FriendRequests';
import Notification from './Notification';

export default function Notifications() {
  const [isOpen, setIsOpen] = useState(false);
  const FriendRequestValue = useRecoilValue(FriendRequests);

  if (!FriendRequestValue || FriendRequestValue.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-left rounded-lg  hover:bg-slate-800/70 transition-colors duration-200"
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <BsBellFill size={18} color="rgb(203 213 225)" />
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center"
            >
              {FriendRequestValue.length}
            </motion.span>
          </div>
          <span className="font-medium text-slate-200">Friend Requests</span>
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2 overflow-hidden"
          >
            {FriendRequestValue.map((req, index) => (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Notification request={req} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
