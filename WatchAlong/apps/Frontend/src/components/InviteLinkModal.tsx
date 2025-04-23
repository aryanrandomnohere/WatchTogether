import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaUserPlus } from 'react-icons/fa';
import { FiCopy } from 'react-icons/fi';

import { motion } from 'framer-motion';

interface InviteLinkModalProps {
  roomId: string;
}

export default function InviteLinkModal({ roomId }: InviteLinkModalProps) {
  const [copied, setCopied] = useState(false);
  const inviteLink = `${window.location.origin}/watch/${roomId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center p-6 space-y-4 bg-slate-900 rounded-xl shadow-xl max-w-md w-full mx-auto"
    >
      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-2">
        <FaUserPlus className="w-8 h-8 text-blue-500" />
      </div>

      <h2 className="text-2xl font-semibold text-slate-100">Invite Friends</h2>

      <p className="text-center text-slate-400 text-sm">
        Share this link with your friends to watch together in real-time
      </p>

      <div className="w-full">
        <div className="flex items-stretch gap-2">
          <div className="flex-1 bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
            <input
              type="text"
              value={inviteLink}
              readOnly
              className="w-full bg-transparent text-slate-200 text-sm px-4 py-3 outline-none"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className={`px-4 rounded-lg flex items-center justify-center transition-all duration-200 ${
              copied
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <FiCopy className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <div className="w-full pt-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-slate-400">Watch together in sync</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-slate-400">Chat and create polls</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <span className="text-sm text-slate-400">No account required to join</span>
        </div>
      </div>
    </motion.div>
  );
}
