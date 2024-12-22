import Show from "./Show";
import Modal from "../ui/Modal";
import { useRecoilState } from "recoil";
import { MovieInfoState } from "../State/MovieInfoState";
import { RiInformation2Fill } from "react-icons/ri";
import ShowInfo from "./Showinfo";

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

interface mediaData {
  listType: string;
  episode:  number;
  season: number
  movie: mData;
}

interface originalCountry {
  country: string;
}

interface genreId {
  genre_id: number;
}


export default function ShowsList({shows, title}:{shows: mediaData[] | mData[] | null | undefined, title:string}) {
  const [MovieInfo, setMovieInfo] =  useRecoilState(MovieInfoState);
  function  handleClick(item:mData) {
    setMovieInfo(item);  
   }


  return (
    <div className="flex flex-col">
  <div className="text-white font-bold text-2xl sm:text-3xl self-start ml-2 sm:ml-3  w-full">
    {title}
  </div>
  <div className="flex items-center justify-start overflow-x-auto sm:overflow-x-visible overflow-y-hidden mb-3 h-68 sm:h-80 space-x-1.5 scrollbar-none">
    {shows &&
      shows.map((item) => (
        <Show key={item?.movie?.id ?? item?.id} item={item?.movie || item} onClick={() => handleClick(item?.movie || item)}>
          <Modal>
            <Modal.open opens="Showinfo">
              <button
                className="absolute bottom-1/2 left-1/2 transform -translate-x-1/2 text-white py-1 px-4 rounded opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                onClick={() => handleClick(item?.movie || item)}
              >
                <RiInformation2Fill className="text-5xl text-yellow-400 opacity-80" />
              </button>
            </Modal.open>
            <Modal.window name="Showinfo">
              <ShowInfo movie={MovieInfo} ep={item?.episode || 1} season={item?.season || 1} />
            </Modal.window>
          </Modal>
        </Show>
      ))}
  </div>
</div>

  )
}

