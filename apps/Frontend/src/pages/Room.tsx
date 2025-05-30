import { useEffect, useState } from 'react';
import { HiDesktopComputer } from 'react-icons/hi';
import { TbArrowBarToLeft, TbArrowBarToRight } from 'react-icons/tb';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { isAuthenticatedState } from '../State/authState';
import { epState } from '../State/epState';
import { lefSideIsOpen } from '../State/leftRoomSpace';
import { controlledPlaying, nowPlaying, wasPlaying } from '../State/playingOnState';
import { userInfo } from '../State/userState';
import ChatWindow from '../components/ChatWindow';
import Chatnav from '../components/Chatnav';
import RoomNav from '../components/RoomNav'
import SeasonBox from '../components/SeasonBox';
import Series from '../components/Series';
import getSocket from '../services/getSocket';

const socket = getSocket();
interface isPlayingType {
  id: number | string;
  title: string | undefined;
  type: string;
  animeId?: string | undefined;
}


export default function Room() {
  const setEp = useSetRecoilState(epState);
  const [playing, setPlaying] = useRecoilState(nowPlaying);
  const wasplaying = useRecoilValue(wasPlaying);
  const [roomName, setRoomName] = useState('');
  const [isOpen, setIsOpen] = useRecoilState(lefSideIsOpen);
  const [chatIsOpen, setChatIsOpen] = useState(true);
  const isAuthenticated = useRecoilValue(isAuthenticatedState);
  const controlledInput = useSetRecoilState(controlledPlaying);
  const Info = useRecoilValue(userInfo);
  const { roomId } = useParams();
  const [navIsOpen, setNavIsOpen] = useState(true);
  const isPlaying: isPlayingType = playing ?? wasplaying ?? { id: '', title: '', type: 'Custom' };
  console.log("room rerendered");
  useEffect(() => {
    if (!roomId || !isAuthenticated) return;
    async function fetchRoomName() {
      const response = await axios.get(
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
      if (isAuthenticated) socket.off('receive-ep', handleChangeEp);
      socket.off('receive-playing', handleReceivePlaying);
      socket.emit('leave-room', roomId);
    };
  }, [roomId, Info]);

  return (
    <div className="bg-slate-200 dark:bg-gray-900 min-h-screen flex flex-col px-1 pt-3 items-start relative">
      {/* Content */}
      <div className="relative z-10 w-full">
        <div className="sm:mt-10 mt-28"></div>
        {navIsOpen ? (
          <RoomNav
            isPlaying={isPlaying}
            setIsOpen={setIsOpen}
            isOpen={isOpen}
            roomName={roomName}
            roomId={roomId}
          />
        ) : (
          <div className="sm:mt-10 mt-28" onClick={() => setNavIsOpen(!navIsOpen)}>
            <HiDesktopComputer className="text-2xl" />
          </div>
        )}

        <div className={`flex w-full gap-2.5 mt-0 transition-all duration-300 ease-in-out`}>
          {/* Left Sidebar */}
          <div
            className={`${
              isOpen && ['Series', 'Anime', 'AnimeUrl'].includes(isPlaying.type) ? 'w-96' : 'w-0'
            } flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden`}
          >
            {['Series', 'Anime', 'AnimeUrl'].includes(isPlaying.type) && (
              <SeasonBox isPlaying={isPlaying} tvId={isPlaying.id} />
            )}
          </div>

          {/* Middle Content */}
          <div className="flex-1 flex min-w-0">
            <div className="flex-1 w-full items-center justify-center h-full min-w-0 bg-black rounded-lg p-1.5">
              <div
                className={`flex items-center justify-center w-full ${!chatIsOpen && !isOpen ? 'h-full' : 'h-[44rem]'} overflow-hidden`}
              >
                <Series
                  id={isPlaying.id}
                  type={isPlaying.type}
                  title={isPlaying.title}
                  animeId={isPlaying.animeId}
                />
              </div>
            </div>
            <div className="w-[1px] h-[44rem] bg-slate-400 dark:bg-white/50 flex items-center relative ml-0">
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
    </div>
  );
}
