import { useEffect, useState } from "react";
import ShowsList from "./Showlist";

interface mData {
    adult: boolean;
    title?: string;
    backdrop_path: string;
    first_air_date: string;
    genre_ids: number[];
    id: number;
    media_type?: string;
    name?: string;
    origin_country?: string[];
    original_language?: string;
    original_name: string;
    overview: string;
    popularity: number;
    poster_path: string;
    vote_average: number;
    vote_count: number;
  }
 


export default function PreviouslyWatched() {
    const [recentlyWatched, setrecentlyWatched] = useState<mData[]>();
    const [popular, setPopular] = useState<mData[]>(); 
    
    
  useEffect(()=>{
    const url = 'https://api.themoviedb.org/3/tv/top_rated?language=en-US&page=1';
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzI5NmMxNjY1NWI1NGE1MzU0MTA4NzIyZWVmMjFhNSIsIm5iZiI6MTczMDkyMTU4My44NzM5OTk4LCJzdWIiOiI2NzJiYzQ2ZjQzM2M4MmVhMjY3ZWExNWEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.T9tYHXZGv0OisrEbFuVodRU7ppPEKLvLAsKMbmJElkA'
      }
    };
    
    fetch(url, options)
      .then(res => res.json())
      .then(json => setPopular(json.results) )
  .catch(err => console.error(err));
      
    
  },[])


    useEffect(()=>{
        const url = 'https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1';
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzI5NmMxNjY1NWI1NGE1MzU0MTA4NzIyZWVmMjFhNSIsIm5iZiI6MTczMDkyMTU4My44NzM5OTk4LCJzdWIiOiI2NzJiYzQ2ZjQzM2M4MmVhMjY3ZWExNWEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.T9tYHXZGv0OisrEbFuVodRU7ppPEKLvLAsKMbmJElkA'
  }
};
 
 fetch(url, options)
  .then(res => res.json())
  .then(json => setrecentlyWatched(json.results))
    
  

    },[])

    return (
      <div className="bg-gray-900 h-screen flex flex-col">
        {/* <div className="row-span-1 col-span-5"></div> Don't remove this */}
        
        <div className="mt-22 sm:mt-16 col-span-5 text-white font-bold text-3xl  self-end mb-4">
         
        </div>
        
      <ShowsList shows={recentlyWatched}/>
        
        <div className=" text-white font-bold text-2xl md:text-3xl self-start ml-4 mt-5 sm:ml-6">
          Recently Watched
        </div>
        
        <ShowsList shows={popular}/>
      </div>
    );
  }
  