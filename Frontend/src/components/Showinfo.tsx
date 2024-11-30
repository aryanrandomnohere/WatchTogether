import React from 'react';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { nowPlaying } from '../State/playingOnState';
import { userInfo } from '../State/userState';

interface mData {
  adult: boolean;
  backdrop_path: string;
  first_air_date: string;
  genre_ids: number[];
  id: number;
  media_type: string;
  name: string;
  origin_country?: string[];
  original_language: string;
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

  const UserInfo =useRecoilValue(userInfo);

  if (!movie) return <div>Loading...</div>;

  const releaseYear = movie.first_air_date
    ? new Date(movie.first_air_date).getFullYear()
    : 'N/A';

  return (<div className='flex flex-col items-center'>
    <div className="relative min-w-fit bg-black">
    {/* <div className="pointer-events: none;">
  <iframe 
      src="https://www.youtube.com/embed/UPNkOwabRDY?autoplay=1&mute=1&controls=0&loop=1&playlist=UPNkOwabRDY" 
      width="560" 
      height="315" 
      title="A YouTube video" 
      frameborder="0" 
      allow="autoplay; encrypted-media" 
      sandbox>
  </iframe>
</div> */}



        <img
          src={`https://image.tmdb.org/t/p/w500/${movie.backdrop_path}`}
          alt={`${movie.name} poster`}
          className="min-w-fit h-80  sm:min-h-full object-cover rounded-lg shadow-md"
        />
         <h1 className="absolute left-1 bottom-0 text-3xl font-extrabold text-center sm:text-left mb-4 text-white font-stencil">
          {movie.name} <span className="text-gray-400">({releaseYear})</span>
        </h1>
      </div>
    <div className="flex gap-6 w-full pt-2 mx-0 shadow-lg rounded-lg overflow-hidden max-w-md sm:flex-row sm:max-w-4xl sm:gap-8">
      {/* Poster/Backdrop */}
      

      {/* Movie Details */}
      <div className="flex flex-col self-start justify-between text-yellow-600 w-full px-5 ">
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
              <span className="font-extrabold">Media Type:</span>{' '}
              <span className="text-gray-400">{movie.media_type}</span>
            </p>
            <p>
              <span className="font-extrabold">Popularity:</span>{' '}
              <span className="text-gray-400">{movie.popularity}</span>
            </p>
          </div>

        {/* Overview */}
        <div className="mt-4">
          <h2 className="text-lg font-extrabold mb-1 text-white">Overview:</h2>
          <p className="text-gray-400 w-150">{movie.overview || 'No description available.'}</p>
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
        <div className="self-center mt-6 mb-8 sm:self-start">
          <Button w="6" onClick={() => {
            setNowPlaying(movie.id);
            navigate(`/watch/${UserInfo.id}`);
          }}>
            Watch Now
          </Button>
        </div>
      </div>
    </div></div>
  );
};

export default ShowInfo;
