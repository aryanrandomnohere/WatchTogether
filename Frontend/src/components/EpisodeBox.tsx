import { useRecoilState, useRecoilValue } from "recoil";
import { epState } from "../State/epState";
import axios from "axios";
import { useParams } from "react-router-dom";
import { userInfo } from "../State/userState";
import getSocket from "../services/getSocket";
const socket = getSocket();
interface EpisodeType {
    episode_number: number;
    episode_type: string;
    id: number;
    name: string;
    overview: string;
    season_number: number;
    show_id: number;
    still_path?: string;
    vote_average: number;
}

export default function EpisodeBox({ episodes }: { episodes: EpisodeType[] }) {
    const [Ep, setEp] = useRecoilState(epState);
   const {roomId} = useParams();
   const Info = useRecoilValue(userInfo)
   const handleEpisodeClick = async (episode: EpisodeType) => { 
    setEp({ episode_number: episode.episode_number, season_number: episode.season_number });
    const currentTime = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
    try {
        const token = localStorage.getItem("token");
        
        const response = await axios.put(
            //@ts-ignore
            `${import.meta.env.VITE_BACKEND_APP_API_BASE_URL}/api/v1/media/setmedia`,
            {
                episode: episode.episode_number,
                season: episode.season_number,
                movie_Id: Number(episode.show_id),
            },
            {
                headers: {
                    authorization: token,
                },
            }
        );
    } catch (error) {
        console.error("Failed to update episode:", error);
    }
    socket.emit("change-ep",episode.episode_number,episode.season_number,roomId)
    socket.emit("send-message", {
        name:Info.username,
        time: currentTime,
        message: `Changed the media to Season: ${episode.season_number} and Ep: ${episode.episode_number}`,
        userId: roomId
    });
};


    return (
        <div className="flex justify-center items-center w-full pt-2">
            <div className="flex-wrap flex w-full max-w-96  gap-1.5 sm:gap-1 justify-center">
                {episodes.map((episode) => {
                    const paddingClass =
                        episode.episode_number.toString().length > 2
                            ? "px-1.5"
                            : episode.episode_number.toString().length > 1
                            ? "px-2.5" 
                            : "px-3";
                    const activeClass =
                        episode.episode_number === Ep.episode_number && episode.season_number === Ep.season_number
                            ? "bg-gray-900 "
                            : "bg-gray-700 hover:bg-gray-500";

                    return (
                        <div
                            key={episode.id}
                            onClick={() => handleEpisodeClick(episode)}
                            aria-label={`Episode ${episode.episode_number}`}
                            className={`p-1.5 ${paddingClass} ${activeClass} text-yellow-300 rounded-sm text-sm font-bold hover:cursor-pointer`}
                        >
                            {episode.episode_number}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
