import { ReactNode } from "react";

interface mData {
    Title: string;
    Year: string;
    imdbID: string;
    Type: string;
    Poster: string;
}
export default function Show({item, children}:{item: mData, children:ReactNode}) {

  return (
    <div
    key={item.imdbID} 
    className="relative flex flex-col items-center justify-center m-2 mt-3 sm:m-5 w-full sm:w-2/5 md:w-1/6 bg-black bg-opacity-30  rounded-lg overflow-hidden shadow-lg transition-transform transform hover:scale-105 group"
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
        {children}
    </div>
    <h3 className="text-center text-white mt-2 font-semibold mb-1">{item.Title}</h3>
</div>
  )
}

