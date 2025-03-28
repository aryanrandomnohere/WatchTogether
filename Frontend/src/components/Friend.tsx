import { useRecoilValue } from "recoil";
import Avatar from "./Avatar";
import FriendActions from "./FriendActions";
import { Friends } from "../State/friendsState";
import { motion } from "framer-motion";

interface Friend {
    id: string;
    username: string;
    status: string;
}

interface FriendProps {
    friend: Friend;
}

export default function Friend({ friend }: FriendProps) {
    const AllFriends = useRecoilValue(Friends);

    if (!AllFriends) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
        >
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Avatar r="9" name={friend.username} />
                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${
                        friend.status !== "OFFLINE" ? "bg-green-500" : "bg-slate-400"
                    }`} />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {friend.username}
                    </h1>
                    <p className={`text-xs ${
                        friend.status !== "OFFLINE" 
                            ? "text-green-500 dark:text-green-400" 
                            : "text-slate-600 dark:text-slate-400"
                    }`}>
                        {friend.status}
                    </p>
                </div>
            </div>
            <div className="flex-shrink-0">
                <FriendActions to={friend.id} />
            </div>
        </motion.div>
    );
}
