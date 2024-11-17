import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { MovieInfoState } from "../State/MovieInfoState";
import Show from "../components/Show";
import { RiInformation2Fill } from "react-icons/ri";
import Modal from "../ui/Modal";
import Showinfo from "../components/Showinfo";
import { useRecoilState} from "recoil";

export default function ShowsDisplay() {
  interface mData {
    Title: string;
    Year: string;
    imdbID: string;
    Type: string;
    Poster: string;
  }

  interface Series {
    success: boolean;
    result: mData[];
  }


  // interface Movie {
  //   Title: string;
  //   Year: string;
  //   Rated: string;
  //   Released: string;
  //   Runtime: string;
  //   Genre: string;
  //   Director: string;
  //   Writer: string;
  //   Actors: string;
  //   Plot: string;
  //   Language: string;
  //   Country: string;
  //   Awards: string;
  //   Poster: string;
  //   Ratings: {
  //     Source: string;
  //     Value: string;
  //   }[];
  //   Metascore: string;
  //   imdbRating: string;
  //   imdbVotes: string;
  //   imdbID: string;
  //   Type: string;
  //   DVD: string;
  //   BoxOffice: string;
  //   Production: string;
  //   Website: string;
  //   Response: string;
  // }
  
  const [media, setMedia] = useState<Series | undefined>(undefined);
  const [MovieInfo, setMovieInfo] =  useRecoilState(MovieInfoState);
// const setMovieInfo = useRecoilState(MovieInfoState);
  const { id } = useParams<{ id: string }>();
  

  async function  handleClick(ImdbId: string) {
   const data = await axios.get(`http://www.omdbapi.com/?i=${ImdbId}&apikey=c4c1f75d`)
   console.log(data);
   
   setMovieInfo(data.data);  
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(
          `https://api.collectapi.com/imdb/imdbSearchByName?query=${id}`,
          {
            headers: {
              authorization: "apikey 3qxa4XE7HSF8jW6TXnB1m1:5jPzdeDrHaI7wkz9weXRyj",
            },
          }
        );
        setMedia(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setMedia({ success: false, result: [] });
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

  if (!media.success) {
    return <div>Internal server error. You can google and get imdbID yourself.</div>;
  }

  return (
    <div className="flex flex-wrap bg-gray-900 min-h-screen justify-center items-center text-zinc-300 mt-24 md:mt-16 gap-5">
      {media.result.map((item) => (
        <Show key={item.imdbID} item={item} onClick={() => handleClick(item.imdbID)}>
          <Modal>
            <Modal.open opens="Showinfo">
              <button
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white py-1 px-4 rounded opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                onClick={() => handleClick(item.imdbID)}
              >
                <RiInformation2Fill className="h-10 w-10 text-yellow-400 opacity-80" />
              </button>
            </Modal.open>
            <Modal.window name="Showinfo">
              <Showinfo movie={MovieInfo} />
            </Modal.window>
          </Modal>
        </Show>
      ))}
    </div>
  );
}
