import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { MovieInfoState } from "../State/MovieInfoState";
import Show from "../components/Show";
import { RiInformation2Fill } from "react-icons/ri";
import Modal from "../ui/Modal";
import Showinfo from "../components/Showinfo";
import { useRecoilState} from "recoil";
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzI5NmMxNjY1NWI1NGE1MzU0MTA4NzIyZWVmMjFhNSIsIm5iZiI6MTczMDkyMTU4My44NzM5OTk4LCJzdWIiOiI2NzJiYzQ2ZjQzM2M4MmVhMjY3ZWExNWEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.T9tYHXZGv0OisrEbFuVodRU7ppPEKLvLAsKMbmJElkA'
  }
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
  const [MovieInfo, setMovieInfo] =  useRecoilState(MovieInfoState);
  const { id } = useParams<{ id: string }>();
  

  async function  handleClick(item:mData) {
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
        const response = await axios.get(`https://api.themoviedb.org/3/search/multi?query=${id}&include_adult=false&language=en-US&page=1`,options)
        console.log(response.data.results);
        setMedia(response.data.results);
      } catch (error) {
        console.error("Error fetching data:", error);
        setMedia(undefined);
      }
    }

    fetchData();
  }, [id]);

  if (!media) {
    return (
      <div className="flex h-screen bg-gray-900 justify-center items-center">
        <div
          className="inline-block h-24 w-24 md:h-36 md:w-36 animate-spin rounded-full text-yellow-600 border-4 border-solid border-current border-r-transparent"
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
    <div className="flex flex-wrap bg-gray-900 justify-center items-center text-zinc-300 mt-24 md:mt-16 gap-5">
      {media.map((item:mData) => (
        <Show key={item.id} item={item} onClick={() => handleClick(item)}>
         <div> <Modal>
            <Modal.open opens="Showinfo">
              <button
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white py-1 px-4 rounded opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                onClick={() => handleClick(item)}
              >
                <RiInformation2Fill className="h-10 w-10 text-yellow-400 opacity-80" />
              </button>
            </Modal.open>
            <Modal.window name="Showinfo">
              <Showinfo movie={MovieInfo} />
            </Modal.window>
          </Modal>
          </div>
        </Show>
      ))}
    </div>
  );
}
