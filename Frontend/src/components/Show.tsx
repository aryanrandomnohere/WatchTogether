import { ReactNode } from "react";

interface mData {
    Title: string;
    Year: string;
    imdbID: string;
    Type: string;
    Poster: string;
}

//@ts-ignore

export default function Show({
    item,
    onClick,
    children,
  }: {
    item: mData;
    onClick?: (ImdbId: string) => void;
    children?: ReactNode;
  }) {
    return (
      <div
        onClick={() => onClick?.(item.imdbID)}
        className="relative hover:cursor-pointer flex flex-col items-center justify-center m-2 mt-3 sm:m-2 w-full sm:w-2/5 md:w-1/6 bg-opacity-30 rounded-xl overflow-hidden shadow-lg transition-transform transform hover:scale-95 group border border-black"
      >
        <div className="relative w-full">
          {item.Poster ? (
            <img
              src={item.Poster}
              alt={item.Title}
              className="w-full h-full object-cover aspect-w-2 aspect-h-3"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <p className="text-white">No Image Available</p>
            </div>
          )}
          
          <div className="absolute inset-0 flex flex-col justify-end p-2 opacity-0 hover:opacity-100 backdrop-blur-sm group-hover:backdrop-blur-sm transition duration-300">
            <p className="text-blue-950 text-sm font-extrabold">{item.Year}</p>
          </div>
  
          {children}
        </div>
        
        {/* Adjusted Title display with default color */}
        <h3 className="text-center text-white mt-2 font-semibold mb-1">
          {item.Title && item.Title.length > 22 ? `${item.Title.slice(0, 22)}...` : item.Title}
        </h3>
      </div>
    );
  }