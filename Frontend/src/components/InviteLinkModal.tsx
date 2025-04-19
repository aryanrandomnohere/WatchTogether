import { useState } from 'react';
import { FcInvite } from 'react-icons/fc';
import { FiCopy } from 'react-icons/fi';
import toast from 'react-hot-toast';

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
    <div className="flex flex-col items-start p-5 space-y-4 bg-white dark:bg-slate-800 rounded shadow-lg">
      {/* <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <FcInvite className="text-2xl" />
        </div>
        <h2 className="text-xl font-semibold">Invite Friends</h2>
      </div> */}
      
      <p className="text-center text-slate-600 dark:text-slate-400 max-w-md">
        Share this link with your friends to watch together
      </p>

      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 p-1 px-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <input
            type="text"
            value={inviteLink}
            readOnly
            className="flex-1 bg-transparent text-slate-800 dark:text-slate-200 text-sm outline-none cursor-default"
          />
          <button
            onClick={handleCopy}
            className={`p-2.5 rounded-md transition-all duration-200 cursor-pointer ${
              copied
                ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            <FiCopy className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
} 