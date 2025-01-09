import { useEffect, useState } from "react"
import RecommendationFrame from "../RecommendationFrame";
interface mData {
    adult: boolean;
    title?: string;
    backdrop_path: string;
    first_air_date: string;
    oridinal_title?:string
    genre_ids: number[] | genreId[];
    id: number;
    media_type?: string;
    release_date:string;
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
    country: string;
  }
  
  interface genreId {
    genre_id: number;
  }
  
export default function Recommendation() {
    const [popular, setPopular] = useState<mData[]>([]) 
    useEffect(()=>{
      async function fetchRecommendation() {
        const trendingResponse = await fetch("https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1", {
                      method: "GET",
                      headers: {
                        accept: "application/json",
                        Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzI5NmMxNjY1NWI1NGE1MzU0MTA4NzIyZWVmMjFhNSIsIm5iZiI6MTczMDkyMTU4My44NzM5OTk4LCJzdWIiOiI2NzJiYzQ2ZjQzM2M4MmVhMjY3ZWExNWEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.T9tYHXZGv0OisrEbFuVodRU7ppPEKLvLAsKMbmJElkA`,
                      },
                    });
                    const trendingData = await trendingResponse.json();
              
                    // Save only the first 8 objects
                    const limitedTrendingData = trendingData.results.slice(0, 9).map((pop: mData) => {
                      return {
                        ...pop, // Correct spread operator
                        media_type: "movie", // Add or overwrite the `media_type` field
                      };
                    });
                    
                    setPopular(limitedTrendingData);  
                }
                fetchRecommendation();
    },[])
  return (
    <div className='md:min-h-[35rem] min-h-52 w-full bg-gray-900 '><RecommendationFrame show={popular[5]}/></div>
  )
}
