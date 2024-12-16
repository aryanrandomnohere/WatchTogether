import { useRecoilState } from "recoil";
import { epState } from "../State/epState";


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

  export default function EpisodeBox({ episodes }: { episodes: EpisodeType[] }) {
    const [Ep, setEp] = useRecoilState(epState);
    return (
        <div className="flex justify-center items-center w-full pt-2">
        <div className="flex-wrap flex w-full gap-2.7 justify-start"> 
          {episodes.map((episode) => (
          <div
            key={episode.id}
            onClick={()=>setEp({episode_number:episode.episode_number,season_number:episode.season_number})}
            className={`p-1.5 ${episode.episode_number.toString().length>1?episode.episode_number.toString().length>2?"px-1.5":"px-2.5":"px-3.5"}  ${ episode.episode_number === Ep.episode_number && episode.season_number === Ep.season_number? "bg-yellow-900" : "bg-yellow-600"} text-white rounded-md text-sm font-bold hover:cursor-pointer`}
          >
            {episode.episode_number}
          </div>
        ))}
        </div>
      </div>
    );
  }
  
  