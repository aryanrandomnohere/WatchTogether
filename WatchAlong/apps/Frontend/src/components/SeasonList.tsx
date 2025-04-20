import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EpisodeType, APIEpisodeType } from '../types';
import EpisodeBox from './EpisodeBox';
import axios from 'axios';

const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzI5NmMxNjY1NWI1NGE1MzU0MTA4NzIyZWVmMjFhNSIsIm5iZiI6MTczMDkyMTU4My44NzM5OTk4LCJzdWIiOiI2NzJiYzQ2ZjQzM2M4MmVhMjY3ZWExNWEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.T9tYHXZGv0OisrEbFuVodRU7ppPEKLvLAsKMbmJElkA';

interface SeasonListProps {
  seasonInfo: {
    name: string;
    season_number: number;
    poster_path: string | null;
  };
  tvId?: string | number;
}

const SeasonList: React.FC<SeasonListProps> = ({ seasonInfo, tvId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [episodes, setEpisodes] = useState<EpisodeType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [episodeCount, setEpisodeCount] = useState<number>(0);

  // Fetch episode count on mount
  useEffect(() => {
    async function getEpisodeCount() {
      if (!tvId) return;
      
      try {
        const url = `https://api.themoviedb.org/3/tv/${tvId}/season/${seasonInfo.season_number}`;
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        });
        setEpisodeCount(response.data.episodes.length);
      } catch (error) {
        console.error('Error fetching episode count:', error);
      }
    }

    getEpisodeCount();
  }, [tvId, seasonInfo.season_number]);

  // Fetch full episode details when opened
  useEffect(() => {
    async function getEpisodes() {
      if (!tvId || !isOpen) return;
      
      try {
        setIsLoading(true);
        const url = `https://api.themoviedb.org/3/tv/${tvId}/season/${seasonInfo.season_number}`;
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        });

        const requiredData = response.data.episodes.map((ep: APIEpisodeType) => ({
          episode_number: ep.episode_number,
          episode_type: ep.episode_type,
          id: ep.id,
          name: ep.name,
          overview: ep.overview,
          season_number: ep.season_number,
          show_id: tvId,
          still_path: ep.still_path,
          vote_average: ep.vote_average,
        }));

        setEpisodes(requiredData);
      } catch (error) {
        console.error('Error fetching episodes:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (isOpen) {
      getEpisodes();
    }
  }, [tvId, seasonInfo.season_number, isOpen]);

  return (
    <motion.div 
      className="flex flex-col w-full"
    >
      <motion.div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-3 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors duration-200"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700"
            whileHover={{ scale: 1.05 }}
          >
            {seasonInfo.poster_path ? (
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={`https://image.tmdb.org/t/p/w92${seasonInfo.poster_path}`}
                alt={seasonInfo.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </motion.div>
          <div className="flex flex-col">
            <motion.h3 
              className="text-sm font-medium text-slate-800 dark:text-slate-200"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {seasonInfo.name}
            </motion.h3>
            <motion.p 
              className="text-xs text-slate-500 dark:text-slate-400"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              {episodeCount} Episodes
            </motion.p>
          </div>
        </div>
        <motion.button 
          className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.button>
      </motion.div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ 
              height: { duration: 0.3, ease: "easeInOut" },
              opacity: { duration: 0.2 }
            }}
            className="pl-4 pr-2 py-1 overflow-hidden"
          >
            {isLoading ? (
              <div className="flex justify-center items-center py-4">
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="loading loading-dots loading-md text-slate-600 dark:text-slate-400"
                />
              </div>
            ) : (
              <EpisodeBox episodes={episodes} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SeasonList;
