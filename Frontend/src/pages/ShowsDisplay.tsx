import { useEffect, useState } from 'react';
import { RiInformation2Fill } from 'react-icons/ri';
import { useParams } from 'react-router-dom';

import axios from 'axios';
import { useRecoilState } from 'recoil';

import { MovieInfoState } from '../State/MovieInfoState';
import Show from '../components/Show';
import ShowInfo from '../components/Showinfo';
import Modal from '../ui/Modal';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    //@ts-ignore
    Authorization: `${import.meta.env.VITE_TMDB_AUTHORIZATION_KEY}`,
  },
};

interface mData {
  adult: boolean;
  backdrop_path: string;
  first_air_date: string;
  genre_ids: number[];
  id: number;
  media_type: string;
  name: string;
  origin_country?: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  vote_average: number;
  vote_count: number;
}
export default function ShowsDisplay() {
  const [media, setMedia] = useState<mData[] | undefined>(undefined);
  const [MovieInfo, setMovieInfo] = useRecoilState(MovieInfoState);
  const { id } = useParams<{ id: string }>();

  async function handleClick(item: mData) {
    setMovieInfo(item);
  }

  useEffect(() => {
    async function fetchData() {
      try {
        // const response = await axios.get(
        //   `https://api.collectapi.com/imdb/imdbSearchByName?query=${id}`,
        //   {
        //     headers: {
        //       authorization: "apikey 3qxa4XE7HSF8jW6TXnB1m1:5jPzdeDrHaI7wkz9weXRyj",
        //     },
        //   }
        // );
        const response = await axios.get(
          `https://api.themoviedb.org/3/search/multi?query=${id}&include_adult=true&language=en-US&page=1`,
          options
        );

        setMedia(response.data.results);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMedia(undefined);
      }
    }

    fetchData();
  }, [id]);

  if (!media) {
    return (
      <div className="flex h-screen bg-slate-200 dark:bg-slate-950  justify-center items-center">
        <div
          className="inline-block h-24 w-24 md:h-36 md:w-36 animate-spin rounded-full text-slate-400 border-4 border-solid border-current border-r-transparent"
          role="status"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (!media) {
    return <div>Internal server error. You can google and get imdbID yourself.</div>;
  }

  return (
    <div className="flex flex-wrap bg-slate-200 dark:bg-slate-950  justify-center items-center text-zinc-300 mt-24 md:mt-16 gap-1.5  sm:gap-3">
      {media.map((item: mData) => {
        if (!item.backdrop_path || !item.poster_path) return;
        return (
          <Show key={item.id} item={item} onClick={() => handleClick(item)}>
            <div>
              {' '}
              <Modal>
                <Modal.open opens="Showinfo">
                  <button
                    className="absolute bottom-1/2 left-1/2 transform -translate-x-1/2 text-white rounded opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    onClick={() => handleClick(item)}
                  >
                    <RiInformation2Fill className="text-5xl text-yellow-400 opacity-80" />
                  </button>
                </Modal.open>
                <Modal.window name="Showinfo">
                  <ShowInfo movie={MovieInfo} />
                </Modal.window>
              </Modal>
            </div>
          </Show>
        );
      })}
    </div>
  );
}
