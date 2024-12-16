import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { controlledPlaying, nowPlaying } from '../State/playingOnState';
import { userInfo } from '../State/userState';
import axios from 'axios';

interface mData {
  adult: boolean;
  title?: string;
  backdrop_path: string;
  first_air_date: string;
  genre_ids: number[];
  id: number;
  media_type?: string | undefined;
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



interface ShowInfoProps {
  movie: mData;
}

const ShowInfo: React.FC<ShowInfoProps> = ({ movie }) => {
  const navigate = useNavigate();
  const setNowPlaying = useSetRecoilState(nowPlaying);
  const controlledInput = useSetRecoilState(controlledPlaying);
  const UserInfo =useRecoilValue(userInfo);
 
 const mType = movie?.original_language === "ja"  ? "Anime": movie?.media_type ==="tv"?"Series":"Movie";

 async function getNewNames() {
  const url = `https://api.themoviedb.org/3/tv/${movie.id}/alternative_titles`;
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
    console.log(possibleNames);
    const finalName:string = possibleNames[0].title.replace(/:/g,"")
    const result = await axios.get(`/api/search?q=${finalName}&page=1`);
    const FullId = result.data[0]?.link_url;
   const Id = FullId.split("-episode")[0];
   return Id
 }


 async function handleWatchNow() {
  if(mType=="Anime"){
    let alternateNames:string="";
    const name:string = movie.name || movie.title||"";
    const formatedName:string=name.replace(/ /g,"-");
    const finalName:string = formatedName.replace(/:/g,"")
    const result = await axios.get(`/api/search?q=${finalName}&page=1`);
    if(!result?.data[0]?.link_url) {
    alternateNames = await getNewNames();
    }
    
    const FullId = result.data[0]?.link_url || alternateNames;
    const Id = FullId.split("-episode")[0];
    const formatedId:string=Id.replace(/ /g,"-");
    console.log(formatedId);
    setNowPlaying({id:formatedId, title:movie.name || movie.title, type:mType });
    controlledInput({id:movie.id, animeId:formatedId, title:movie.name || movie.title, type:mType })
    navigate(`/watch/${!UserInfo.id?"guest" : UserInfo.id}`);
    return;
  }

  setNowPlaying({id:movie.id.toString(), title:movie.name || movie.title, type:mType });
  controlledInput({id:movie.id, title:movie.name || movie.title, type:mType })
  navigate(`/watch/${!UserInfo.id?"guest" : UserInfo.id}`);
  return;
}


  if (!movie) return <div className='h-51 sm:h- flex justify-center items-center w-80'><span className="loading loading-dots loading-lg"></span></div>;

  const releaseYear = movie.first_air_date
    ? new Date(movie.first_air_date).getFullYear()
    : "";

  return (<div className='flex flex-col items-center '>
<div className="relative min-w-fit bg-black">
  <img
    src={`https://image.tmdb.org/t/p/w500/${movie.backdrop_path}`}
    alt={`${movie.name} poster`}
    className=" h-51  sm:h-96 sm:min-h-full object-cover rounded-lg shadow-md filter brightness-90"
  />
  <div className="absolute left-0 bottom-0  px-4 py-2 rounded-lg">
    <h1 className="  md:text-3xl text-xl sm:text-2xl   font-extrabold text-white font-stencil">
      {!movie.name? movie.title : movie.name} <span className="text-gray-400">{releaseYear?`(${releaseYear})`:""}</span>
    </h1>
  </div>  
</div>


    <div className="flex gap-6 w-full pt-2 mx-0 shadow-lg rounded-lg overflow-hidden max-w-md sm:flex-row sm:max-w-4xl sm:gap-8">
      {/* Poster/Backdrop */}
      

      {/* Movie Details */}
      <div className="flex flex-col self-start justify-between text-yellow-600 w-full px-4 ">
        {/* Title and Release Year */}
       

        {/* Movie Quick Stats */}
         <div className="text-sm flex justify-between">
            <p>
              <span className="font-extrabold">Language:</span>{' '}
              <span className="text-gray-400">{movie.original_language}</span>
            </p>
            <p>
              <span className="font-extrabold">Rating:</span>{' '}
              <span className="text-gray-400">{movie.vote_average}</span>
            </p>
            <p>
              <span className="font-extrabold">Type:</span>{' '}
              <span className="text-gray-400">{mType}</span>
            </p>
          </div>

        {/* Overview */}
        <div className="sm:mt-2.5 mt-2">
          <h2 className="sm:text-lg text-base font-extrabold mb-1 text-white">Overview:</h2>
          <p className="text-gray-400 text-sm sm:test-base w-86 sm:w-150 md:w-150">{movie.overview ?`${movie.overview.length > 300? movie.overview.slice(0,300)+"...":movie.overview}` :'No description available.'}</p>
        </div>

        {/* Language and Origin */}
        {/* <div className="flex flex-col gap-2 mt-4 sm:flex-row sm:gap-8 mb-6">
          <p>
            <span className="font-semibold">Language:</span>{' '}
            <span className="text-gray-400">{movie.original_language}</span>
          </p>
          {movie.origin_country && movie.origin_country.length > 0 && (
            <p>
              <span className="font-semibold">Origin:</span>{' '}
              <span className="text-gray-400">{movie.origin_country.join(', ')}</span>
            </p>
          )}
        </div> */}

        {/* Additional Info */}
        {/* {movie.genre_ids.length > 0 && (
          <div>
            <h2 className="text-lg font-extrabold mb-1 text-white">Genres:</h2>
            <p className="text-gray-400">{movie.genre_ids.join(', ')}</p>
          </div>
        )} */}
        {/* <div>
          <h2 className="text-lg font-extrabold mb-1 text-white">Vote Count:</h2>
          <p className="text-gray-400">{movie.vote_count}</p>
        </div> */}

        {/* Watch Now Button */}
        <div className="self-center mt-3 mb-3 sm:mt-6 sm:mb-6 sm:self-start">
          <Button w="6" onClick={handleWatchNow}>
            Watch Now
          </Button>
        </div>
      </div>
    </div></div>
  );
};

export default ShowInfo;