import React from 'react';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { nowPlaying } from '../State/playingOnState';
import {jwtDecode} from 'jwt-decode';

interface Movie {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: {
    Source: string;
    Value: string;
  }[];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
}

interface ShowInfoProps {
  movie: Movie;
}

const ShowInfo: React.FC<ShowInfoProps> = ({ movie }) => {

  const navigate = useNavigate();
 
  const token = localStorage.getItem("token");
  const setNowPlaying = useSetRecoilState(nowPlaying)
  // Decode token if available
  const userId = token ? jwtDecode<{ userId: string }>(token).userId : null;

  if (!movie) return <div>Loading...</div>;

  
  function handleClick() {
    setNowPlaying(movie.imdbID)
    navigate(`/watch/${userId}`);
  }

  return (
    <div className="flex flex-col gap-4 p-4 mx-auto shadow-lg rounded-lg overflow-hidden max-w-md sm:flex-row sm:max-w-4xl sm:gap-6">
      {/* Left side: Image */}
      <div className="flex-shrink-0 self-center sm:self-start">
        <img
          src={movie.Poster}
          alt={`${movie.Title} poster`}
          className="w-48 h-72 sm:w-64 sm:h-96 object-cover rounded-lg shadow-md"
        />
      </div>

      {/* Right side: Movie details */}
      <div className="flex flex-col justify-between text-yellow-600">
        <h1 className="text-xl font-bold text-center mb-2 sm:text-2xl sm:self-start">
          {movie.Title} <span className="text-gray-400">({movie.Year})</span>
        </h1>
        
        <div>
          <h2 className="text-lg font-extrabold mb-1 text-white">Info:</h2>
          <div className="text-sm flex flex-col gap-1">
            <p><span className="font-extrabold">Rated:</span> <span className="text-gray-400">{movie.Rated}</span></p>
            <p><span className="font-extrabold">Released:</span> <span className="text-gray-400">{movie.Released}</span></p>
            <p><span className="font-extrabold">Runtime:</span> <span className="text-gray-400">{movie.Runtime}</span></p>
            <p><span className="font-extrabold">Genre:</span> <span className="text-gray-400">{movie.Genre}</span></p>
            <p><span className="font-extrabold">Director:</span> <span className="text-gray-400">{movie.Director}</span></p>
            <p><span className="font-extrabold">Actors:</span> <span className="text-gray-400">{movie.Actors}</span></p>
            <p><span className="font-extrabold">Plot:</span> <span className="text-gray-400">{movie.Plot}</span></p>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="text-lg font-extrabold mb-1 text-white">Ratings:</h2>
          <p><span className="font-semibold">IMDB Rating:</span> <span className="text-gray-400">{movie.imdbRating}</span></p>
        </div>

        <div className="flex flex-col gap-2 mt-4 sm:flex-row sm:gap-12 mb-6">
          <p><span className="font-semibold">Language:</span> <span className="text-gray-400">{movie.Language}</span></p>
          <p><span className="font-semibold">Origin:</span> <span className="text-gray-400">{movie.Country}</span></p>
          <p><span className="font-semibold">Awards:</span> <span className="text-gray-400">{movie.Awards}</span></p>
        </div>

        <div className="self-center mt-4 sm:self-end">
          <Button w="6" onClick={handleClick}>Watch Now</Button>
        </div>
      </div>
    </div>
  );
};

export default ShowInfo;
