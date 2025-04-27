import { FcInvite } from 'react-icons/fc';
import { MdScreenShare } from 'react-icons/md';
import { RiExchangeLine } from 'react-icons/ri';
import { TfiViewList } from 'react-icons/tfi';
import axios from 'axios';
import AlertBox from '../ui/AlertBox';
import Modal from '../ui/Modal';
import ChangeVideo from './ChangeVideo';
import InviteLinkModal from './InviteLinkModal';
import { useRecoilState, useRecoilValue } from 'recoil';
import { screenShareState } from '../State/screenShareState';
import getSocket from '../services/getSocket';
import { userInfo } from '../State/userState';
import { useEffect } from 'react';

interface isPlayingType {
  id: number | string;
  title: string | undefined;
  type: string;
  animeId?: string | undefined;
}

interface screenShareType {
  screenShare: boolean;
  screenSharerId: string | undefined;
}
export default function RoomNav({
  isPlaying,
  setIsOpen,
  isOpen,
  roomName,
  roomId,
  videoRef,
}: {
  isPlaying: isPlayingType;
  setIsOpen: (isOpen: boolean) => void;
  isOpen: boolean;
  roomName: string;
  roomId: string | undefined;
  videoRef: React.RefObject<HTMLVideoElement>;
}) {
  const [screenShare, setScreenShare] = useRecoilState(screenShareState);
  const Info = useRecoilValue(userInfo);



async function screenShareInit() {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 60, max: 60 }
    }
  });
    if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
    }
    const peer = createPeer();
    stream.getTracks().forEach(track => peer.addTrack(track, stream));
    setScreenShare({
      screenShare: true,
      screenSharerId: localStorage.getItem('userId') || undefined
    });
    getSocket().emit('screen-share', localStorage.getItem('userId') || Info.id, roomId);
}


function createPeer() {
    const peer = new RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.stunprotocol.org"
            }
        ]
    });
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);

    return peer;
}

async function handleNegotiationNeededEvent(peer: RTCPeerConnection) {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const payload = {
        sdp: peer.localDescription
    };

    const { data } = await axios.post('/broadcast', payload);
    const desc = new RTCSessionDescription(data.sdp);
    peer.setRemoteDescription(desc).catch(e => console.log(e));
}

useEffect(() => {
  getSocket().on('screen-share', (screenShare: screenShareType) => {
    setScreenShare(screenShare);
  });

  return () => {
    getSocket().off('screen-share');
  };
});


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
        { !screenShare.screenShare ? <div onClick={screenShareInit} className="my-button bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-white p-1.5 hover:cursor-pointer flex text-sm justify-center items-center gap-2 hover:bg-slate-400 dark:hover:bg-slate-800">
          <MdScreenShare className="sm:text-xl"  />
          Screen Share
        </div> : screenShare.screenSharerId === localStorage.getItem('userId') ? <div  className="my-button bg-slate-300 dark:bg-red-600 text-slate-800 dark:text-white p-1.5 hover:cursor-pointer flex text-sm justify-center items-center gap-2 hover:bg-slate-400 dark:hover:bg-slate-800">
          <MdScreenShare className="sm:text-xl"  />
          Stop Screen Share
        </div>:
        <div className="my-button bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-white p-1.5 hover:cursor-pointer flex text-sm justify-center items-center gap-2 hover:bg-slate-400 dark:hover:bg-slate-800">
          <MdScreenShare className="sm:text-xl"  />
          Currently Sharing
        </div>
        }
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
