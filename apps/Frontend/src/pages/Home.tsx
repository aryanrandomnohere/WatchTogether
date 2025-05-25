import { useEffect, useState } from 'react';

import axios from 'axios';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { Favourite, recentlyWatched, userMedia } from '../State/allMedia';
import { isAuthenticatedState } from '../State/authState';
import Recommendation from '../components/Recommendation';
import ShowsList from '../components/Showlist';
// import HomePageItems from "../components/HomePageItems";
import SlideShow from '../components/SlideShow';

interface mData {
  adult: boolean;
  title?: string;
  backdrop_path: string;
  first_air_date: string;
  genre_ids: number[] | genreId[];
  id: number;
  media_type?: string;
  name?: string;
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

export default function Home() {
  const isAuthenticated = useRecoilValue(isAuthenticatedState);
  const recentlywatched = useRecoilValue(recentlyWatched);
  const favourites = useRecoilValue(Favourite);
  const [popular, setPopular] = useState<mData[]>([]);
  const [popularSeries, setPopularSeries] = useState<mData[]>([]);

  const setAllMedia = useSetRecoilState(userMedia);
  // const lastWatched: mData[] | undefined  = recentlywatched?.((item)=> item.movie);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchData = async () => {
      try {
        // Fetching media data
        //@ts-ignore
        const mediaResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_APP_API_BASE_URL}/api/v1/media/allmedia`,
          {
            headers: { authorization: localStorage.getItem('token') },
          }
        );
        setAllMedia(mediaResponse.data.data);
        // Fetching trending data
        const trendingMoviesResponse = await fetch(
          'https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1',
          {
            method: 'GET',
            headers: {
              accept: 'application/json',
              Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzI5NmMxNjY1NWI1NGE1MzU0MTA4NzIyZWVmMjFhNSIsIm5iZiI6MTczMDkyMTU4My44NzM5OTk4LCJzdWIiOiI2NzJiYzQ2ZjQzM2M4MmVhMjY3ZWExNWEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.T9tYHXZGv0OisrEbFuVodRU7ppPEKLvLAsKMbmJElkA`,
            },
          }
        );
        const popularMovieData = await trendingMoviesResponse.json();

        // Save only the first 8 objects
        const limitedPopularMovieData = popularMovieData.results.map((pop: mData) => {
          return {
            ...pop, // Correct spread operator
            media_type: 'movie', // Add or overwrite the `media_type` field
          };
        });
        setPopular(limitedPopularMovieData);

        const trendingSeriesResponse = await fetch(
          'https://api.themoviedb.org/3/tv/top_rated?language=en-US&page=1',
          {
            method: 'GET',
            headers: {
              accept: 'application/json',
              Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzI5NmMxNjY1NWI1NGE1MzU0MTA4NzIyZWVmMjFhNSIsIm5iZiI6MTczMDkyMTU4My44NzM5OTk4LCJzdWIiOiI2NzJiYzQ2ZjQzM2M4MmVhMjY3ZWExNWEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.T9tYHXZGv0OisrEbFuVodRU7ppPEKLvLAsKMbmJElkA`,
            },
          }
        );
        const popularSeriesData = await trendingSeriesResponse.json();

        // Save only the first 8 objects
        const limitedPopularSeriesData = popularSeriesData.results.map((pop: mData) => {
          return {
            ...pop, // Correct spread operator
            media_type: 'Series', // Add or overwrite the `media_type` field
          };
        });
        setPopularSeries(limitedPopularSeriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [setAllMedia]);

  if (!isAuthenticated)
    return <div className="flex h-screen w-screen justify-center items-center">Hello World</div>;

  return (
    <div className="flex flex-col  placeholder:bg-gray-900 h-screen overflow-y-auto scrollbar-none   pl-2 w-full ">
      <div className="sm:mt-12 mt-22"></div>
      <Recommendation />
      <div className="hidden">
        <SlideShow />
      </div>

      {popular && <ShowsList title="Popular Movies" shows={popular?.slice(0, 12)} />}
      {popularSeries && <ShowsList title="Popular Series" shows={popularSeries?.slice(0, 12)} />}
      <div className=" h-screen flex flex-col  pl-2 w-full ">
        <ShowsList title="Recently Watched" shows={recentlywatched?.slice(0, 12)} />
      </div>

      {favourites && favourites?.length > 0 && (
        <div className="h-screen flex flex-col  pl-2 w-full ">
          <ShowsList title="Favourites" shows={favourites?.slice(0, 12)} />
        </div>
      )}
    </div>
  );
}
