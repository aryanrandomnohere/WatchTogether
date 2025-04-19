import { useParams } from 'react-router-dom';

import axios from 'axios';
import { useRecoilState, useRecoilValue } from 'recoil';

import { epState } from '../State/epState';
import { userInfo } from '../State/userState';
import getSocket from '../services/getSocket';

const socket = getSocket();
interface EpisodeType {
  episode_number: number;
  episode_type: string;
  id: number;
  name: string;
  overview: string;
  season_number: number;
  show_id: number;
  still_path?: string;
  vote_average: number;
}

export default function EpisodeBox({ episodes }: { episodes: EpisodeType[] }) {
  const [Ep, setEp] = useRecoilState(epState);
  const { roomId } = useParams();
  const Info = useRecoilValue(userInfo);
  const handleEpisodeClick = async (episode: EpisodeType) => {
    setEp({ episode_number: episode.episode_number, season_number: episode.season_number });
    const currentTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    try {
      const token = localStorage.getItem('token');

      const response = await axios.put(
        //@ts-ignore
        `${import.meta.env.VITE_BACKEND_APP_API_BASE_URL}/api/v1/media/setmedia`,
        {
          episode: episode.episode_number,
          season: episode.season_number,
          movie_Id: Number(episode.show_id),
        },
        {
          headers: {
            authorization: token,
          },
        }
      );
    } catch (error) {
      console.error('Failed to update episode:', error);
    }
    socket.emit('change-ep', episode.episode_number, episode.season_number, roomId);
    socket.emit('send-message', {
      name: Info.username,
      time: currentTime,
      message: `Changed the media to Season: ${episode.season_number} and Ep: ${episode.episode_number}`,
      userId: roomId,
    });
  };

  return (
    <div className="flex justify-center items-center w-full pt-2 pb-3">
      <div className="flex-wrap flex w-full max-w-96 gap-2 justify-between px-2">
        {episodes.map(episode => {
          const paddingClass =
            episode.episode_number.toString().length > 2
              ? 'px-1.5'
              : episode.episode_number.toString().length > 1
                ? 'px-2.5'
                : 'px-3';
          const activeClass =
            episode.episode_number === Ep.episode_number &&
            episode.season_number === Ep.season_number
              ? 'bg-slate-800 dark:bg-slate-700 text-yellow-400 dark:text-yellow-300 ring-2 ring-yellow-400/50 dark:ring-yellow-300/50'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100';

          return (
            <div
              key={episode.id}
              onClick={() => handleEpisodeClick(episode)}
              aria-label={`Episode ${episode.episode_number}`}
              className={`p-1.5 ${paddingClass} ${activeClass} rounded shadow-sm font-medium transition-all duration-200 ease-in-out transform hover:scale-105 hover:cursor-pointer`}
            >
              {episode.episode_number}
            </div>
          );
        })}
      </div>
    </div>
  );
}
