import { useEffect, useState } from 'react';
import { FcInvite } from 'react-icons/fc';
import { MdScreenShare } from 'react-icons/md';
import { RiExchangeLine } from 'react-icons/ri';
import { TbArrowBarToLeft, TbArrowBarToRight } from 'react-icons/tb';
import { TfiViewList } from 'react-icons/tfi';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { isAuthenticatedState } from '../State/authState';
import { epState } from '../State/epState';
import { lefSideIsOpen } from '../State/leftRoomSpace';
import { controlledPlaying, nowPlaying, wasPlaying } from '../State/playingOnState';
import { userInfo } from '../State/userState';
import ChangeVideo from '../components/ChangeVideo';
import ChatWindow from '../components/ChatWindow';
import Chatnav from '../components/Chatnav';
import SeasonBox from '../components/SeasonBox';
import Series from '../components/Series';
import getSocket from '../services/getSocket';
import AlertBox from '../ui/AlertBox';
import Modal from '../ui/Modal';
import InviteLinkModal from '../components/InviteLinkModal';

const socket = getSocket();
interface isPlayingType {
  id: number | string;
  title: string | undefined;
  type: string;
  animeId?: string | undefined;
}
//made a commentrujfk

export default function Room() {
  const setEp = useSetRecoilState(epState);
  const [playing, setPlaying] = useRecoilState(nowPlaying);
  const wasplaying = useRecoilValue(wasPlaying);
  const [roomName, setRoomName] = useState('');
  // const [newMessage, setNewMessage] = useState("");
  const [isOpen, setIsOpen] = useRecoilState(lefSideIsOpen);
  const [chatIsOpen, setChatIsOpen] = useState(true);
  const isAuthenticated = useRecoilValue(isAuthenticatedState);
  const controlledInput = useSetRecoilState(controlledPlaying);
  // const ChatType = useRecoilState(chatType)
  const Info = useRecoilValue(userInfo);
  const { roomId } = useParams();

  const isPlaying: isPlayingType = playing ?? wasplaying ?? { id: '', title: '', type: 'Custom' };

  // const handleScreenShare = () =>{
  //   const strea
  // }

  useEffect(() => {
    if (!roomId || !isAuthenticated) return;

    async function fetchRoomName() {      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_APP_API_BASE_URL}/api/v1/room/getRoomName/${roomId}`,
        {
          headers: {
            authorization: localStorage.getItem('token'),
          },
        }
      );
      setRoomName(`${response.data.roomDetails.displayname}'s Room`);
    }
    fetchRoomName();

    const handleReceivePlaying = (playing: {
      playingId: string;
      playingTitle: string;
      playingType: string;
      playingAnimeId: string;
    }) => {
      const {
        playingId: id,
        playingTitle: title,
        playingType: type,
        playingAnimeId: animeId,
      } = playing;
      setPlaying({ id, title, type, animeId });
      controlledInput({ id, title, type, animeId });
      socket.emit('update-status', Info.id, `Watching ${title}`);
    };
    const handleChangeEp = async (episode: number, season: number) => {
      setEp(prevEp => ({
        ...prevEp,
        episode_number: episode,
        season_number: season,
      }));
    };

    socket.emit('join-room', roomId, Info.id);
    socket.on('receive-ep', handleChangeEp);
    socket.on('receive-playing', handleReceivePlaying);

    return () => {
      // setPlaying({id:"",animeId:"",title:"",type:""})
      if (isAuthenticated) socket.off('receive-ep', handleChangeEp);
      socket.off('receive-playing', handleReceivePlaying);
      socket.emit('leave-room', roomId);
    };
  }, [roomId, Info]);

  return (
    <div className="bg-slate-200 dark:bg-gray-900 min-h-screen flex flex-col px-1 pt-4 items-start">
      <div className="sm:mt-14 mt-28"></div>
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
              className={`hover:cursor-pointer text-2xl font-bold  ml-2 ${isOpen && ['Series', 'Anime', 'AnimeUrl'].includes(isPlaying.type) ? 'text-slate-600 dark:text-slate-400' : ''}`}
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
          <div className="bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-white p-1.5 hover:cursor-pointer flex text-sm justify-center items-center gap-2 hover:bg-slate-400 dark:hover:bg-slate-800">
            <MdScreenShare className="sm:text-xl" />
            Screen Share
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

      <div
        className={`flex w-full gap-2.5 mt-0 transition-all duration-300 ease-in-out`}
      >
        {/* Left Sidebar */}
        <div
          className={`${
            isOpen && ['Series', 'Anime', 'AnimeUrl'].includes(isPlaying.type)
              ? 'w-96'
              : 'w-0'
          } flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden`}
        >
          {['Series', 'Anime', 'AnimeUrl'].includes(isPlaying.type) && (
            <SeasonBox tvId={isPlaying.id} />
          )}
        </div>

        {/* Middle Content */}
        <div className="flex-1 flex min-w-0">
          <div className="flex-1 w-full items-center justify-center h-full min-w-0 bg-black/50 rounded-lg  p-1.5">
            <div className={`flex items-center justify-center w-full ${!chatIsOpen && !isOpen ? "h-full" : "h-[44rem]" }  overflow-hidden`}>
              <Series
                id={isPlaying.id}
                type={isPlaying.type}
                title={isPlaying.title}
                animeId={isPlaying.animeId}
              />
            </div>
          </div>
          <div className="w-[1px] h-[44rem] bg-slate-400 dark:bg-white/50 flex items-center relative ml-4">
            <div className="hover:cursor-pointer" onClick={() => setChatIsOpen(!chatIsOpen)}>
              {!chatIsOpen ? (
                <TbArrowBarToLeft className="absolute top-1/2 -right-3 text-white dark:text-black dark:bg-white font-extrabold bg-slate-950 rounded-full p-1 text-2xl" />
              ) : (
                <TbArrowBarToRight className="absolute top-1/2 -right-3 text-white dark:text-black dark:bg-white font-extrabold bg-slate-950 rounded-full p-1 text-2xl" />
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div
          className={`${
            chatIsOpen ? 'w-96' : 'w-0'
          } flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden`}
        >
        <div>
            <Chatnav />
            <div className="flex flex-col justify-between border-slate-300 dark:border-white/20 bg-slate-200 dark:bg-slate-900 h-[42rem]">
            <ChatWindow />
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
