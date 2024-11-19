import { ReactNode } from "react";
interface mData {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

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
      className="relative hover:cursor-pointer flex flex-col items-center justify-center min-w-[200px] md:min-w-[225px] max-h-[1000px] sm:max-h-[500px] m-2 mt-3 sm:m-2 w-full sm:w-2/5 md:w-1/6 bg-opacity-30 rounded-xl overflow-hidden shadow-lg transition-transform transform hover:scale-95 group border border-black duration-300"
    >
      <div className="relative w-full min-w-[200px] min-h-[250px]">
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

        <div className="absolute inset-0 flex flex-col h-full justify-center items-center p-2 opacity-0 hover:opacity-100 backdrop-blur-sm group-hover:backdrop-blur-sm transition duration-500">
          {/* <p className="text-yellow-400 text-border text-lg font-extrabold font-stencil">{item.Year}</p> */}
          <div className="group-hover ">
        {children}
        </div>
        </div>

        {/* <h3  className=" absolute text-center text-border text-yellow-400 font-bold font-stencil text-lg md:text-xl mt-2  mb-1 top-1 opacity-0 group-hover:opacity-100 w-full ">
        {item.Title && item.Title.length > 22
          ? `${item.Title.slice(0, 22)}...`
          : item.Title}
      </h3> */}
      </div>

      
    </div>
  );
}
