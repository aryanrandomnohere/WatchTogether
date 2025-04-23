import { RiInformation2Fill } from 'react-icons/ri';

import { useRecoilState } from 'recoil';

import { MovieInfoState } from '../State/MovieInfoState';
import Modal from '../ui/Modal';
import Show from './Show';
import ShowInfo from './Showinfo';
import ShowSkeleton from './ShowSkeleton';

interface mData {
  adult: boolean;
  title?: string;
  backdrop_path: string;
  first_air_date: string;
  genre_ids: number[] | genreId[];
  id: number;
  season?: number;
  episode?: number;
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

interface mediaData {
  listType: string;
  episode: number;
  season: number;
  movie: mData;
}

interface originalCountry {
  country: string;
}

interface genreId {
  genre_id: number;
}

export default function ShowsList({
  shows,
  title,
  isLoading = false,
}: {
  shows: mediaData[] | mData[] | null | undefined;
  title: string;
  isLoading?: boolean;
}) {
  const [MovieInfo, setMovieInfo] = useRecoilState(MovieInfoState);
  function handleClick(item: mData) {
    setMovieInfo(item);
  }

  return (
    <div className="flex flex-col">
      <div className="text-slate-800 dark:text-white font-bold text-2xl sm:text-3xl self-start mb-2 mt-1 w-full">
        {title}
      </div>
      <div
        className={`flex items-center justify-start overflow-x-auto sm:overflow-x-visible overflow-y-hidden mb-3 h-fit space-x-2 scrollbar-none`}
      >
        {isLoading ? (
          <>
            <ShowSkeleton />
            <ShowSkeleton />
            <ShowSkeleton />
            <ShowSkeleton />
            <ShowSkeleton />
            <ShowSkeleton />
          </>
        ) : (
          shows &&
          shows.map(item => (
            //@ts-ignore
            <Show
              key={item?.movie?.id ?? item?.id}
              item={item?.movie || item}
              onClick={() => handleClick(item?.movie || item)}
            >
              <Modal> 
                <Modal.open opens="Showinfo">
                  <button
                    className="absolute bottom-1/2 left-1/2 transform -translate-x-1/2 text-slate-800 dark:text-white py-1 px-4 rounded opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    //@ts-ignore
                    onClick={() => handleClick(item?.movie || item)}
                  >
                    <RiInformation2Fill className="text-3xl text-yellow-500 dark:text-yellow-400 opacity-80" />
                  </button>
                </Modal.open>
                <Modal.window name="Showinfo">
                  <ShowInfo movie={MovieInfo} ep={item?.episode || 1} season={item?.season || 1} />
                </Modal.window>
              </Modal>
            </Show>
          ))
        )}
      </div>
    </div>
  );
}
