import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { PiPlayLight } from "react-icons/pi";

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

    const [media, setMedia] = useState<Series | undefined>(undefined);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    function handleClick(ImdbId: string) {
        navigate(`/nowwatching/${ImdbId}`);
    }

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get(
                    `https://api.collectapi.com/imdb/imdbSearchByName?query=${id}`,
                    {
                        headers: {
                            authorization: "apikey 7vdvU52HSSdZJfjz9ksDB2:6iYwAz4i84DguDL7im4Ym4",
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
        return <div className="flex h-screen w-full bg-gray-900 justify-center items-center"><div
        className="inline-block h-24 w-24 md:h-36 md:w-36  animate-spin rounded-full text-orange-600  border-4 border-solid  border-current border-r-transparent  align-[-0.125em] text-warning motion-reduce:animate-[spin_1.5s_linear_infinite]"
        role="status">
        <span
          className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
        >Loading...</span>
      </div></div>
    }

    if (!media.success) {
        return (
            <div>
                Internal server error. You can google and get imdbID yourself.
            </div>
        );
    }

    return (
        <div className="flex flex-wrap bg-gray-900 min-h-screen justify-center text-zinc-300">
            {media.result.map((item) => (
                <div
                    key={item.imdbID}  onClick={() => handleClick(item.imdbID)}
                    className="relative flex flex-col items-center justify-center m-2 mt-3 sm:m-5 w-full sm:w-2/5 md:w-1/6 bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform transform hover:scale-105 group"
                >
                    <div className="relative w-full">
                        <img
                            src={item.Poster}
                            alt={item.Title}
                            className="w-full h-full object-cover aspect-w-2 aspect-h-3"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-end p-2 opacity-0 hover:opacity-100">
                            <p className="text-white text-sm">{item.Year}</p>
                        </div>
                        <button
                            className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-white py-1 px-4 rounded opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                            onClick={() => handleClick(item.imdbID)}
                        >
                            <PiPlayLight className="h-7 w-7" />
                        </button>
                    </div>
                    <h3 className="text-center text-white mt-2 font-semibold mb-1">{item.Title}</h3>
                </div>
            ))}
        </div>
    );
}
