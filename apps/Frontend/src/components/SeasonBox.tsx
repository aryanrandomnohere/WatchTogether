import { useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import SeasonList from './SeasonList';

const API_URL = 'https://api.themoviedb.org/3/tv/{tv_id}?language=en-US';
const TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzI5NmMxNjY1NWI1NGE1MzU0MTA4NzIyZWVmMjFhNSIsIm5iZiI6MTczMDkyMTU4My44NzM5OTk4LCJzdWIiOiI2NzJiYzQ2ZjQzM2M4MmVhMjY3ZWExNWEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.T9tYHXZGv0OisrEbFuVodRU7ppPEKLvLAsKMbmJElkA';

interface seasonType {
  name: string;
  poster_path: string;
  vote_average: string;
  season_number: number;
}

interface ApiSeasonResponse {
  name: string;
  poster_path: string;
  vote_average: string;
  season_number: string;
}

export default function SeasonBox({ tvId }: { tvId?: string | number }) {
  const [seasonInfo, setSeasonInfo] = useState<seasonType[]>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function getSeriesDetails() {
      try {
        setIsLoading(true);
        //@ts-expect-error - API URL string replacement
        const response = await fetch(API_URL.replace('{tv_id}', tvId.toString()), {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        const requiredData = data.seasons.map((s: ApiSeasonResponse) => ({
          name: s.name,
          poster_path: s.poster_path,
          vote_average: s.vote_average,
          season_number: Number(s.season_number),
        }));
        setSeasonInfo(requiredData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching series details:', error);
      }
    }
    getSeriesDetails();
  }, [tvId]);

  if (isLoading || !seasonInfo)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col w-full h-full bg-gradient-to-br from-white/50 to-white/30 dark:from-slate-950 dark:to-slate-900 backdrop-blur-sm rounded-lg overflow-hidden"
      >
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="flex flex-col gap-2 p-4">
          {[1, 2, 3,4,5,6].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2" />
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col w-full bg-gradient-to-br from-white/50 to-white/30 dark:from-slate-950 dark:to-slate-900 backdrop-blur-sm rounded-lg overflow-hidden max-h-[720px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-slate-600 transition-all duration-200"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm px-4 py-3 border-b border-slate-200 dark:border-slate-800"
      >
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-yellow-500 dark:text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path
              fillRule="evenodd"
              d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
              clipRule="evenodd"
            />
          </svg>
          Seasons
        </h2>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex flex-col gap-2 p-4"
      >
        <AnimatePresence>
          {seasonInfo.map((s: seasonType, index) => {
            if (s.name === 'Specials') return null;
            return (
              <motion.div
                key={s.season_number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="transform hover:scale-[1.02] transition-transform duration-200"
              >
                <SeasonList tvId={tvId} seasonInfo={s} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

{
  /* <img src={`https://image.tmdb.org/t/p/w200/${seasonInfo.poster_path}`}/> */
}
