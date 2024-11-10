import { atom } from "recoil";


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


export const MovieInfoState = atom<Movie>({
    key:"MovieInfo",
    default: undefined

})


// { Title: "Guardians of the Galaxy Vol. 2",
// Year: "2017",
// Rated: "PG-13",
// Released: "05 May 2017",
// Runtime: "136 min",
// Genre: "Action, Adventure, Comedy",
// Director: "James Gunn",
// Writer: "James Gunn, Dan Abnett, Andy Lanning",
// Actors: "Chris Pratt, Zoe Saldana, Dave Bautista",
// Plot: "The Guardians struggle to keep together as a team while dealing with their personal family issues, notably Star-Lord's encounter with his father, the ambitious celestial being Ego.",
// Language: "English",
// Country: "United States",
// Awards: "Nominated for 1 Oscar. 15 wins & 60 nominations total",
// Poster: "https://m.media-amazon.com/images/M/MV5BNWE5MGI3MDctMmU5Ni00YzI2LWEzMTQtZGIyZDA5MzQzNDBhXkEyXkFqcGc@._V1_SX300.jpg",
// Ratings: [
//   { Source: "Internet Movie Database", Value: "7.6/10" },
//   { Source: "Rotten Tomatoes", Value: "85%" },
//   { Source: "Metacritic", Value: "67/100" },
// ],
// Metascore: "67",
// imdbRating: "7.6",
// imdbVotes: "774,852",
// imdbID: "tt3896198",
// Type: "movie",
// DVD: "N/A",
// BoxOffice: "$389,813,101",
// Production: "N/A",
// Website: "N/A",
// Response: "True",
// }