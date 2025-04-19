import { useRecoilValue } from 'recoil';

import { Friends } from '../State/friendsState';
import Friend from './Friend';

export default function AllFriends() {
  const friends = useRecoilValue(Friends);

  if (!friends || friends.length === 0) {
    return (
      <div className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">No friends yet</div>
    );
  }

  return (
    <div className="space-y-1">
      {friends.map(friend => (
        <Friend key={friend.id} friend={friend} />
      ))}
    </div>
  );
}
