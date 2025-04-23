import { useParams } from 'react-router-dom';

import axios from 'axios';
import { motion } from 'framer-motion';
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

      //@ts-expect-error - VITE_BACKEND_APP_API_BASE_URL is defined in env
      await axios.put(
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

  // Filter out special episodes
  const regularEpisodes = episodes.filter(episode => episode.episode_type !== 'special');

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col w-full space-y-2 py-2"
    >
      {regularEpisodes.map(episode => {
        const isActive =
          episode.episode_number === Ep.episode_number &&
          episode.season_number === Ep.season_number;
        const activeClass = isActive
          ? 'bg-slate-100 dark:bg-slate-800 ring-2 ring-yellow-400/50 dark:ring-yellow-300/50'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50';

        return (
          <motion.div
            key={episode.id}
            variants={item}
            onClick={() => handleEpisodeClick(episode)}
            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 ${activeClass}`}
            whileHover={{ scale: 1.01, x: 4 }}
            whileTap={{ scale: 0.99 }}
          >
            <motion.div className="relative w-24 h-14 flex-shrink-0" whileHover={{ scale: 1.05 }}>
              {episode.still_path ? (
                <motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  src={`https://image.tmdb.org/t/p/w185${episode.still_path}`}
                  alt={episode.name}
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <div className="w-full h-full bg-slate-200 dark:bg-slate-700 rounded-md flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-slate-400 dark:text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
              <motion.div
                className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {episode.episode_number}
              </motion.div>
            </motion.div>
            <div className="flex flex-col flex-grow min-w-0">
              <motion.h3
                className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {episode.name}
              </motion.h3>
              <motion.p
                className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                {episode.overview}
              </motion.p>
            </div>
            {isActive && (
              <motion.div
                className="flex-shrink-0 text-yellow-400 dark:text-yellow-300"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
