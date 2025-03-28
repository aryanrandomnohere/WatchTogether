import { useRecoilValue, useSetRecoilState } from "recoil";
import { nowPlaying } from "./State/playingOnState";
import axios from "axios";
import { userInfo } from "./State/userState";

interface mData {
    adult: boolean;
    title?: string;
    backdrop_path: string;
    first_air_date: string;
    original_title?:string;
    genre_ids: number[] | genreId[];
    id: number;
    media_type?: string;
    name?: string;
    release_date?:string;
    origin_country?: string[] | originalCountry[];
    original_language?: string;
    original_name: string;
    overview: string;
    popularity: number;
    poster_path: string;
    vote_average: number;
    vote_count: number;
  }
  
  
  interface originalCountry {
    country: string;
  }
  
  interface genreId {
    genre_id: number;
  }

export default function RecommendationFrame({show}:{show:mData}) {  
  const Info = useRecoilValue(userInfo)
  //@ts-ignore
  const setNowPlaying = useSetRecoilState(nowPlaying)
  //@ts-ignore
  async function getNewNames() {
    const url = `https://api.themoviedb.org/3/tv/${show.id}/alternative_titles`;
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzI5NmMxNjY1NWI1NGE1MzU0MTA4NzIyZWVmMjFhNSIsIm5iZiI6MTczMDkyMTU4My44NzM5OTk4LCJzdWIiOiI2NzJiYzQ2ZjQzM2M4MmVhMjY3ZWExNWEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.T9tYHXZGv0OisrEbFuVodRU7ppPEKLvLAsKMbmJElkA'
      }
    };
    
    const results = await fetch(url, options)
      const data = await results.json();    
      const possibleNames = data.results.filter((name:{iso_3166_1: string;  title: string; type: string;})=> name.type === "Romaji" )   
      const finalName:string = possibleNames[0].title.replace(/:/g,"")
      const result = await axios.get(`/api/search?q=${finalName}&page=1`);
      const FullId = result.data[0]?.link_url;
     const Id = FullId.split("-episode")[0];
     return Id
   }
  function handleWatchNow(){
    //@ts-ignore
    axios.post(`${import.meta.env.VITE_BACKEND_APP_API_BASE_URL}/api/v1/media/mediaaction`,{
      userId:Info.id,
      show,
      listType:"Recently Watched"
    },{
      headers: {
        authorization: localStorage.getItem("token"),
      },
    })
  }
    if(!show) return <></>
  return (
<div className="relative w-full h-full text-slate-800 dark:text-white flex items-center">
  {/* Background Image (Now Behind the Text) */}
  <div className="absolute inset-0 w-full flex justify-end h-full">
    <div className="relative w-2/3 h-full">
      {/* Image */}
      <img
        src={`https://image.tmdb.org/t/p/original/${show.backdrop_path}`}
        className="w-full h-full object-cover"
      />

      {/* Faded Overlay (Now Covers the Image Properly) */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-200 dark:from-slate-950 via-transparent to-transparent"></div>
    </div>
  </div>

  {/* Text Content */}
  <div className="relative flex flex-col ml-3 md:ml-10 justify-center max-w-[60%]">
    <h1 className="text-3xl md:text-6xl font-stencil mb-0.5 md:mb-1">
      {show.title || show.name || show.original_name}
    </h1>
    <div className="flex items-center text-xs gap-5 mb-3 max-w-96 text-slate-800 dark:text-white font-extrabold">
      <div className="border border-slate-400 dark:border-slate-600 p-0.5 rounded text-xs">{show.media_type?.toLocaleUpperCase()}</div>
      <div className="border hidden md:block border-slate-400 dark:border-slate-600 p-0.5 rounded text-xs">{show.first_air_date || show.release_date}</div>
      <div className="border border-slate-400 dark:border-slate-600 p-0.5 rounded text-xs">{show.original_language?.toUpperCase()}</div>
      <div className="border border-slate-400 dark:border-slate-600 p-0.5 rounded text-xs">{show.vote_average}</div>
    </div>
    <p className="max-w-80 md:max-w-2xl md:text-base font-comic text-xs hidden md:block">
      {show.overview}
    </p>
    <div onClick={handleWatchNow} className="p-1 md:p-2 text-yellow-600 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white hover:cursor-pointer border border-slate-400 dark:border-slate-600 hover:border-slate-500 dark:hover:border-slate-500 mt-5 md:mt-10 w-24 md:w-32 flex justify-center text-xs md:text-base font-extrabold rounded font-comic">Watch Now</div>
  </div>
</div>




  )
}
