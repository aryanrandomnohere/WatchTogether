import { useEffect, useState } from 'react';

import SeasonList from './SeasonList';

const API_URL = 'https://api.themoviedb.org/3/tv/{tv_id}?language=en-US'; // Replace {tv_id} with the actual TV show ID
const TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzI5NmMxNjY1NWI1NGE1MzU0MTA4NzIyZWVmMjFhNSIsIm5iZiI6MTczMDkyMTU4My44NzM5OTk4LCJzdWIiOiI2NzJiYzQ2ZjQzM2M4MmVhMjY3ZWExNWEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.T9tYHXZGv0OisrEbFuVodRU7ppPEKLvLAsKMbmJElkA';

interface seasonType {
  name: string;
  poster_path: string;
  vote_average: string;
  season_number: string;
}

export default function SeasonBox({ tvId }: { tvId?: string | number }) {
  const [isOpen, setIsOpen] = useState<number | string | null>(null);
  const [seasonInfo, setSeasonInfo] = useState<seasonType[]>();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    async function getSeriesDetails() {
      try {
        setIsLoading(true);
        //@ts-ignore
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
        const requiredData = data.seasons.map((s: seasonType) => ({
          name: s.name,
          poster_path: s.poster_path,
          vote_average: s.vote_average,
          season_number: s.season_number,
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
      <div className="flex justify-center items-center h-full w-full">
        <span className="loading loading-dots loading-lg text-slate-600 dark:text-slate-400"></span>
      </div>
    );

  return (
    <div className="flex flex-col w-full border-l border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm max-h-[650px] overflow-y-auto scrollbar-thin scrollbar-track-slate-100 dark:scrollbar-track-slate-800 scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-slate-600 transition-all duration-200">
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-4 py-3">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Seasons</h2>
      </div>
      <div className="flex flex-col gap-1 p-2">
        {seasonInfo.map((s: seasonType) =>{ 
          if(s.name === "Specials") return null;
          return (
           <SeasonList
            key={s.season_number}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            tvId={tvId}
            seasonInfo={s}
          />)
        }
        )}
      </div>
    </div>
  );
}

{
  /* <img src={`https://image.tmdb.org/t/p/w200/${seasonInfo.poster_path}`}/> */
}
