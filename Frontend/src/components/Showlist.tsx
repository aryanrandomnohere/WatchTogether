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
    genre_ids: number[];
    id: number;
    media_type?: string;
    name?: string;
    origin_country?: string[];
    original_language?: string;
    original_name: string;
    overview: string;
    popularity: number;
    poster_path: string;
    vote_average: number;
    vote_count: number;
  }

export default function ShowsList({shows}:{shows:mData[] | undefined}) {
  const [MovieInfo, setMovieInfo] =  useRecoilState(MovieInfoState);
  function  handleClick(item:mData) {
    setMovieInfo(item);  
   }


  return (
    <div className="row-span-5 col-span-5 flex items-center justify-start overflow-x-auto scrollbar-thin  overflow-y-hidden space-x-4 sm:px-4 px-1"> {shows && shows.map((item) => (
        <Show key={item.id} item={item} onClick={()=>handleClick(item)}><Modal>
        <Modal.open opens="Showinfo">
          <button
            className="absolute bottom-1/2 left-1/2 transform -translate-x-1/2 text-white py-1 px-4 rounded opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            onClick={()=>handleClick(item)}
          >
            <RiInformation2Fill className="text-5xl text-yellow-400 opacity-80" />
          </button>
        </Modal.open>
        <Modal.window name="Showinfo">
          <ShowInfo movie={MovieInfo} />
        </Modal.window>
      </Modal></Show>
      ))}</div>
  )
}