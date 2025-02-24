import { ReactNode } from "react";

interface mData {
  adult: boolean;
  title?: string;
  backdrop_path: string;
  first_air_date: string;
  genre_ids: number[] | genreId[] ;
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

interface originalCountry {
country:string
}

interface genreId {
  genre_id:number
}

export default function Show({
  item,
  onClick,
  children,
}: {
  item: mData;
  onClick?: (id: number) => void;
  children?: ReactNode;
}) {
  const imageUrl = `https://image.tmdb.org/t/p/w500/${item.poster_path}`;
  return (
    <div
      role="button"
      onClick={() => onClick?.(item.id)}
      className="relative hover:cursor-pointer flex flex-col items-center justify-center   sm:min-w-[100px] bg-slate-200  my-2 sm:min-h-[100px]   max-h-[1000px] sm:max-h-[500px]  sm:mx-0.5 max-w-[150px]   min-w-[100px] sm:w-2/5 md:w-1/6 bg-opacity-10 rounded-md overflow-hidden shadow-lg transition-transform transform hover:scale-95 group duration-300"
    >
      <div className="relative w-full  min-h-fit">
        {item.poster_path ? (
          <img
            loading="lazy"
            src={imageUrl}
            alt={item.name || item.title || "Unknown Item"}
            className="w-full h-full object-cover aspect-w-2 aspect-h-3"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <p className="text-white">No Image Available</p>
          </div>
        )}

        <div className="absolute inset-0 flex flex-col h-full justify-center items-center p-2 opacity-0 hover:opacity-100 backdrop-blur-sm bg-black /50 group-hover:bg-black/50 transition duration-500">
          <div className="group-hover">{children}</div>
        </div>
      </div>
    </div>
  );
}
