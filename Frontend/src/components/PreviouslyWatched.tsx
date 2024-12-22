// import { useEffect, useState } from "react";
// import ShowsList from "./Showlist";
// import { useRecoilValue, useSetRecoilState } from "recoil";
// import { Favourite, recentlyWatched, userMedia } from "../State/allMedia";
// import axios from "axios";

// interface mData {
//   adult: boolean;
//   title?: string;
//   backdrop_path: string;
//   first_air_date: string;
//   genre_ids: number[] | genreId[];
//   id: number;
//   media_type?: string;
//   name?: string;
//   origin_country?: string[] | originalCountry[];
//   original_language?: string;
//   original_name: string;
//   overview: string;
//   popularity: number;
//   poster_path: string;
//   vote_average: number;
//   vote_count: number;
// }

// interface originalCountry {
//   country: string;
// }

// interface genreId {
//   genre_id: number;
// }

// export default function PreviouslyWatched() {
//   const recentlywatched = useRecoilValue(recentlyWatched);
//   const favourites = useRecoilValue(Favourite );
//   const [popular, setPopular] = useState<mData[]>([]);
//   const setAllMedia = useSetRecoilState(userMedia);
//   // const lastWatched: mData[] | undefined  = recentlywatched?.map((item)=> item.movie);
//   console.log(recentlywatched);
  
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetching media data
//         const mediaResponse = await axios.get("http://192.168.0.106:5000/api/v1/media/allmedia", {
//           headers: { authorization: localStorage.getItem("token") },
//         });
//         setAllMedia(mediaResponse.data.data);
  
//         // Fetching trending data
//         const trendingResponse = await fetch("https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1", {
//           method: "GET",
//           headers: {
//             accept: "application/json",
//             Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzI5NmMxNjY1NWI1NGE1MzU0MTA4NzIyZWVmMjFhNSIsIm5iZiI6MTczMDkyMTU4My44NzM5OTk4LCJzdWIiOiI2NzJiYzQ2ZjQzM2M4MmVhMjY3ZWExNWEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.T9tYHXZGv0OisrEbFuVodRU7ppPEKLvLAsKMbmJElkA`,
//           },
//         });
//         const trendingData = await trendingResponse.json();
  
//         // Save only the first 8 objects
//         const limitedTrendingData = trendingData.results.slice(0, 9).map((pop: mData) => {
//           return {
//             ...pop, // Correct spread operator
//             media_type: "movie", // Add or overwrite the `media_type` field
//           };
//         });
        
//         setPopular(limitedTrendingData);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };
//     fetchData();
//   }, [setAllMedia]);
  

//   return (
//     <div className="bg-gray-900 h-screen flex flex-col  pl-2 w-full ">
//       <div className="md:flex-wrap">
//       <ShowsList title="Popular" shows={popular} />
// </div>
//       <ShowsList title="Recently Watched" shows={recentlywatched?.slice(0,9)} />
//       {/* <ShowsList title="Favourites" shows={favourites}/> */}
//      </div>
//   );
// }
