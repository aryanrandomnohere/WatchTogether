import { FcInvite } from 'react-icons/fc';
import { MdScreenShare } from 'react-icons/md';
import { RiExchangeLine } from 'react-icons/ri';
import { TfiViewList } from 'react-icons/tfi';
import axios from 'axios';
import AlertBox from '../ui/AlertBox';
import Modal from '../ui/Modal';
import ChangeVideo from './ChangeVideo';
import InviteLinkModal from './InviteLinkModal';


interface isPlayingType {
  id: number | string;
  title: string | undefined;
  type: string;
  animeId?: string | undefined;
}


export default function RoomNav({
  isPlaying,
  setIsOpen,
  isOpen,
  roomName,
  roomId,
}: {
  isPlaying: isPlayingType;
  setIsOpen: (isOpen: boolean) => void;
  isOpen: boolean;
  roomName: string;
  roomId: string | undefined;
}) {



  return (
    <div className="flex-wrap sm:flex sm:justify-between gap-2 mb-4 px-4 items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <div
          onClick={() => {
            if (['Series', 'Anime', 'AnimeUrl'].includes(isPlaying.type)) {
              setIsOpen(!isOpen);
              return;
            }
          }}
          className={` `}
        >
          <TfiViewList
            className={`hover:cursor-pointer text-2xl font-bold ml-2 ${isOpen && ['Series', 'Anime', 'AnimeUrl'].includes(isPlaying.type) ? 'text-slate-600 dark:text-slate-400' : ''}`}
          />
        </div>
        <div>
          <Modal>
            <Modal.open opens="changeVideo">
              <div>
                <RiExchangeLine className="hover:cursor-pointer text-4xl text-slate-800 dark:text-white" />
              </div>
            </Modal.open>
            <Modal.window name="changeVideo">
              <ChangeVideo />
            </Modal.window>
          </Modal>
        </div>
       
      </div>
      <div className="sm:text-lg font-bold text-slate-800 dark:text-white">{roomName}</div>
      <AlertBox>
        <AlertBox.open opens="inviteLink">
          <div className="py-2 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200 cursor-pointer">
            <FcInvite className="text-xl" />
            <span className="font-medium">Invite Friends</span>
          </div>
        </AlertBox.open>
        <AlertBox.window name="inviteLink">
          {roomId && <InviteLinkModal roomId={roomId} />}
        </AlertBox.window>
      </AlertBox>
    </div>
  );
}
