
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
    if(!show) return <></>
  return (
<div className="relative w-full h-full text-white flex items-center">
  {/* Background Image (Now Behind the Text) */}
  <div className="absolute inset-0 w-full flex justify-end h-full">
    <div className="relative w-2/3 h-full">
      {/* Image */}
      <img
        src={`https://image.tmdb.org/t/p/original/${show.backdrop_path}`}
        className="w-full h-full object-cover"
      />

      {/* Faded Overlay (Now Covers the Image Properly) */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-transparent to-transparent"></div>
    </div>
  </div>

  {/* Text Content */}
  <div className="relative z-10 flex flex-col ml-5 md:ml-10 justify-center max-w-[50%]">
    <h1 className="text-3xl md:text-6xl font-stencil mb-1">
      {show.title || show.name || show.original_name}
    </h1>
    <div className="flex items-center text-xs justify-between mb-3 max-w-96 text-white font-extrabold">
      <div className="bg-yellow-600/20 p-1">{show.media_type?.toLocaleUpperCase()}</div>
      <div className="  bg-yellow-600/20 p-1">{show.first_air_date || show.release_date}</div>
      <div></div>
      <div className=" bg-yellow-600/20 p-1">{show.original_language}</div>
      <div className="bg-yellow-600/20 p-1">{show.vote_average}</div>
    </div>
    <p className="max-w-80 md:max-w-2xl md:text-base font-comic text-xs hidden md:block">
      {show.overview}
    </p>
    <div className="border-yellow-600 p-0.5 md:p-2 text-yellow-60 hover:bg-yellow-600 text-yellow-600 hover:text-white hover:cursor-pointer border mt-10 w-32 flex justify-center text-sm md:text-base font-extrabold rounded font-comic">Watch Now</div>
  </div>
</div>




  )
}
