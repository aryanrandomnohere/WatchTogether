import { useRecoilValue } from "recoil";
import { epState } from "../State/epState";



export default function Series({id ,type,title, animeId="" }: {id: number | string,type:string, title:string | undefined, animeId?:string }) {
    console.log(title);
    
    const {episode_number, season_number} = useRecoilValue(epState);
    if (id && type==="Anime") {
        
        return (
              <iframe 
                 className="w-screen h-56 sm:h-[600px] rounded"
                  src={`https://2anime.xyz/embed/${animeId}-episode-${episode_number}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen

              ></iframe>
          );
      }

      if (id && type==="Series") {
        
        
        return (
              <iframe 
                 className="w-screen h-56 lg:h-[600px]  sm:h-full rounded"
                  src={`https://www.2embed.cc/embedtv/${id}&s=${season_number}&e=${episode_number}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen

              ></iframe>
          );
      }

    
  if (!id) {
      return (
          <div className="flex justify-center items-center text-lg md:text-2xl lg:text-3xl mt-36 lg:mt-72 text-center px-4 font-medium text-zinc-600">
              There is no media link or any IMDb ID present
          </div>
      );
  } else {
      if (id && type==="Movie") {
        
        
        return (
              <iframe 
                 className="w-screen h-56 lg:h-[600px]  sm:h-full rounded"
                  src={`https://www.2embed.cc/embedtvfull/${id}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen

              ></iframe>
          );
      } else {
          return (
              <video controls className="w-screen h-56 lg:h-[600px]  sm:h-full rounded">
                  <source src={id.toString()} type="video/mp4" />
                  Your browser does not support the video tag.
              </video>
          );
      }
  }
}