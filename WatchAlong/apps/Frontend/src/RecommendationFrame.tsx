import { motion } from 'framer-motion';
import axios from 'axios';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { nowPlaying } from './State/playingOnState';
import { userInfo } from './State/userState';

interface mData {
  adult: boolean;
  title?: string;
  backdrop_path: string;
  first_air_date: string;
  original_title?: string;
  genre_ids: number[] | genreId[];
  id: number;
  media_type?: string;
  name?: string;
  release_date?: string;
  origin_country?: string[] | originalCountry[];
  original_language?: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  vote_average: number;
  vote_count: number;
}

interface originalCountry {
  country: string;
}

interface genreId {
  genre_id: number;
}

export default function RecommendationFrame({ show }: { show: mData }) {
  const Info = useRecoilValue(userInfo);
  //@ts-ignore
  const setNowPlaying = useSetRecoilState(nowPlaying);

  //@ts-ignore
  async function getNewNames() {
    const url = `https://api.themoviedb.org/3/tv/${show.id}/alternative_titles`;
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzI5NmMxNjY1NWI1NGE1MzU0MTA4NzIyZWVmMjFhNSIsIm5iZiI6MTczMDkyMTU4My44NzM5OTk4LCJzdWIiOiI2NzJiYzQ2ZjQzM2M4MmVhMjY3ZWExNWEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.T9tYHXZGv0OisrEbFuVodRU7ppPEKLvLAsKMbmJElkA',
      },
    };

    const results = await fetch(url, options);
    const data = await results.json();
    const possibleNames = data.results.filter(
      (name: { iso_3166_1: string; title: string; type: string }) => name.type === 'Romaji'
    );
    const finalName: string = possibleNames[0].title.replace(/:/g, '');
    const result = await axios.get(`/api/search?q=${finalName}&page=1`);
    const FullId = result.data[0]?.link_url;
    const Id = FullId.split('-episode')[0];
    return Id;
  }

  function handleWatchNow() {
    //@ts-ignore
    axios.post(
      `${import.meta.env.VITE_BACKEND_APP_API_BASE_URL}/api/v1/media/mediaaction`,
      {
        userId: Info.id,
        show,
        listType: 'Recently Watched',
      },
      {
        headers: {
          authorization: localStorage.getItem('token'),
        },
      }
    );
  }

  if (!show) return <></>;

  return (
    <div className="relative w-full h-full text-slate-800 dark:text-white flex items-center">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 w-full flex justify-end h-full">
        <div className="relative w-2/3 h-full overflow-hidden">
          <motion.img
            initial={{ scale: 1.02, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            src={`https://image.tmdb.org/t/p/original/${show.backdrop_path}`}
            className="w-full h-full object-cover"
            alt={show.title || show.name || "Show backdrop"}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-slate-950/5 to-slate-950/90"></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent"></div>
      </div>

      {/* Content Container */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10 flex flex-col ml-4 md:ml-16 justify-center max-w-[90%] md:max-w-[45%] py-6 md:py-12"
      >
        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-3xl md:text-6xl font-bold text-white mb-2 md:mb-4"
        >
          {show.title || show.name || show.original_name}
        </motion.h1>

        {/* Metadata */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap items-center gap-3 mb-4 text-sm"
        >
          {show.media_type && (
            <span className="px-2 py-1 bg-slate-800/60 rounded-md text-slate-200 font-medium">
              {show.media_type.toUpperCase()}
            </span>
          )}
          {(show.first_air_date || show.release_date) && (
            <span className="px-2 py-1 bg-slate-800/60 rounded-md text-slate-200 font-medium hidden md:block">
              {new Date(show.first_air_date || show.release_date || '').getFullYear()}
            </span>
          )}
          {show.original_language && (
            <span className="px-2 py-1 bg-slate-800/60 rounded-md text-slate-200 font-medium">
              {show.original_language.toUpperCase()}
            </span>
          )}
          <span className="px-2 py-1 bg-slate-800/60 rounded-md text-slate-200 font-medium">
            ★ {show.vote_average.toFixed(1)}
          </span>
        </motion.div>

        {/* Overview */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-sm md:text-base text-slate-300 max-w-xl mb-6 line-clamp-3 md:line-clamp-none hidden md:block"
        >
          {show.overview}
        </motion.p>

        {/* Watch Now Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={handleWatchNow}
          className="px-6 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 
                   text-slate-900 dark:text-slate-100 font-semibold rounded-lg 
                   shadow-lg hover:shadow-slate-500/20 transition-all duration-200 w-fit
                   flex items-center gap-2 text-sm md:text-base"
        >
          Watch Now
        </motion.button>
      </motion.div>
    </div>
  );
}
