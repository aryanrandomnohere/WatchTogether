import { Dispatch, SetStateAction, useEffect, useState } from "react";
import EpisodeBox from "./EpisodeBox";
import axios from "axios";
import { epState } from "../State/epState";
import { useRecoilValue } from "recoil";
import { FaLongArrowAltRight } from "react-icons/fa";

interface seasonType {
    name:string,
    poster_path:string,
    vote_average:string,
    season_number:string,
  }

  interface EpisodeType {
    episode_number: number; // Assuming this is always a number
    episode_type: string; // You may need to adjust based on API response
    id:  number; // Assuming IDs are strings
    name: string; // Most likely a string
    overview: string; // Most likely a string
    season_number: number; // Assuming this is always a number
    show_id: number; // Assuming this is a string
    still_path?: string; // Optional, as some episodes may not have an image
    vote_average: number; // Typically a numeric rating
  }
  
  const TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzI5NmMxNjY1NWI1NGE1MzU0MTA4NzIyZWVmMjFhNSIsIm5iZiI6MTczMDkyMTU4My44NzM5OTk4LCJzdWIiOiI2NzJiYzQ2ZjQzM2M4MmVhMjY3ZWExNWEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.T9tYHXZGv0OisrEbFuVodRU7ppPEKLvLAsKMbmJElkA";  

export default function SeasonList({seasonInfo, tvId, isOpen, setIsOpen}:{seasonInfo:seasonType, tvId:string|number|undefined, isOpen:number | string| null, setIsOpen:Dispatch<SetStateAction<number | string | null>>}) {
    const Ep = useRecoilValue(epState);
    const [episodes, setEpisodes] = useState<EpisodeType[]>()
    useEffect(() => {
        async function getEpisodes() {
          try {
            const url = `https://api.themoviedb.org/3/tv/${tvId}/season/${seasonInfo.season_number}`;
            const response = await axios.get(url, {
              headers: {
                Authorization: `Bearer ${TOKEN}`,
              },
            });
    
         //@ts-ignore
            const requiredData = response.data.episodes.map((ep) => ({
              episode_number: ep.episode_number,
              episode_type: ep.episode_type, 
              id: ep.id,
              name: ep.name,
              overview: ep.overview,
              season_number: ep.season_number,
              show_id: tvId,
              still_path: ep.still_path,
              vote_average: ep.vote_average,
            }));
    
            setEpisodes(()=>requiredData); 
            console.log(episodes);
            
          } catch (error) {
            console.error("Error fetching episodes:", error);
          }
        }
    
        getEpisodes();
        
      }, [tvId]);


if(seasonInfo.name ==="Specials") return null

    return (
        <div className={`flex flex-col   items-center w-full px-1 pt-1.5 `}>
  {/* Season Header */}
  <div 
    className={`flex items-center px-2 py-3 sm:px-2 sm:pt-1.5  w-full justify-between border-b border-yellow-600/30 hover:cursor-pointer transition duration-200`} 
    onClick={() => setIsOpen((is) => (is === seasonInfo.season_number ? "" : seasonInfo.season_number))}
  >
    <h1 className={`${Ep.season_number === Number(seasonInfo.season_number) ? "text-yellow-600 border-yellow-600":""} text-sm md:text-base max-w-56 font-bold   text-white mb-1`}>
      {seasonInfo.name}
    </h1>
    <FaLongArrowAltRight
      className={`text-2xl border ${Ep.season_number === Number(seasonInfo.season_number) ? "text-yellow-600 border-yellow-600":""} rounded-full p-1  m-1 transform transition-transform ${
        isOpen === seasonInfo.season_number ? "rotate-90" : ""
      }`}
    />
  </div>

  {/* Episode List */}
  {isOpen === seasonInfo.season_number ? (
    episodes ? (
      <div className=" w-full"><EpisodeBox episodes={episodes} /></div>
    ) : (
      <div className="text-red-600 mt-2">Internal Server Error</div>
    )
  ) : null}
</div>

      
      
  )
}