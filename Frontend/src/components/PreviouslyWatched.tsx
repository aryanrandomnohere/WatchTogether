import Show from "./Show";

const recentlyWatched = [
    {
        "Title": "Naruto: Shippuden",
        "Year": "2007–2017",
        "imdbID": "tt0988824",
        "Type": "series",
        "Poster": "https://m.media-amazon.com/images/M/MV5BNDgzYzNhOGUtMWI1Mi00YjJkLWI2NGItOWFlNDE4ZjE0NGExXkEyXkFqcGc@._V1_SX300.jpg"
    },
    {
        "Title": "Naruto",
        "Year": "2002–2007",
        "imdbID": "tt0409591",
        "Type": "series",
        "Poster": "https://m.media-amazon.com/images/M/MV5BZTNjOWI0ZTAtOGY1OS00ZGU0LWEyOWYtMjhkYjdlYmVjMDk2XkEyXkFqcGc@._V1_SX300.jpg"
    },
    {
        "Title": "Boruto: Naruto Next Generations",
        "Year": "2017–2023",
        "imdbID": "tt6342474",
        "Type": "series",
        "Poster": "https://m.media-amazon.com/images/M/MV5BNDgzYzNhOGUtMWI1Mi00YjJkLWI2NGItOWFlNDE4ZjE0NGExXkEyXkFqcGc@._V1_SX300.jpg"
    },
    {
        "Title": "The Last: Naruto the Movie",
        "Year": "2014",
        "imdbID": "tt3717532",
        "Type": "movie",
        "Poster": "https://m.media-amazon.com/images/M/MV5BMjk1NzA4Njg4Ml5BMl5BanBnXkFtZTgwMDgxODQ5MzE@._V1_SX300.jpg"
    },
    {
        "Title": "Boruto: Naruto the Movie",
        "Year": "2015",
        "imdbID": "tt4618398",
        "Type": "movie",
        "Poster": "https://m.media-amazon.com/images/M/MV5BY2Y0NGE5YjgtNzFlZS00NzJjLThlMDQtZDZhNjQxNTc2NmUwXkEyXkFqcGc@._V1_SX300.jpg"
    },
    {
        "Title": "Road to Ninja - Naruto the Movie",
        "Year": "2012",
        "imdbID": "tt2290828",
        "Type": "movie",
        "Poster": "https://m.media-amazon.com/images/M/MV5BMTQ5MTcyNDYwMV5BMl5BanBnXkFtZTgwNzMzNzc0MjE@._V1_SX300.jpg"
    },
    {
        "Title": "Naruto the Movie: Ninja Clash in the Land of Snow",
        "Year": "2004",
        "imdbID": "tt0476680",
        "Type": "movie",
        "Poster": "https://m.media-amazon.com/images/M/MV5BYzZiNmI3MWYtYzA4YS00YjE4LWFhMzQtYzQ3MTE2MTcyOGM1XkEyXkFqcGc@._V1_SX300.jpg"
    },
    
];

const WatchLater = [
    {
        "Title": "Attack on Titan",
        "Year": "2013–2023",    
        "imdbID": "tt2560140",
        "Type": "series",
        "Poster": "https://m.media-amazon.com/images/M/MV5BNjY4MDQxZTItM2JjMi00NjM5LTk0MWYtOTBlNTY2YjBiNmFjXkEyXkFqcGc@._V1_SX300.jpg"
    },
    {
        "Title": "Attack on Titan Part 1",
        "Year": "2015",
        "imdbID": "tt2072230",
        "Type": "movie",
        "Poster": "https://m.media-amazon.com/images/M/MV5BNDY3NmQ4ZTgtNTE3NC00OWFhLTg5MjQtZDkxMTE2YjgxODdmXkEyXkFqcGc@._V1_SX300.jpg"
    },
    {
        "Title": "Attack on Titan: Chronicle",
        "Year": "2020",
        "imdbID": "tt12415546",
        "Type": "movie",
        "Poster": "https://m.media-amazon.com/images/M/MV5BMTcwMzNhYmEtOTVjNi00NDY1LTk2M2UtMzdiNDM5YzFiMDlhXkEyXkFqcGc@._V1_SX300.jpg"
    },
    {
        "Title": "Attack on Titan: The Roar of Awakening",
        "Year": "2018",
        "imdbID": "tt7941892",
        "Type": "movie",
        "Poster": "https://m.media-amazon.com/images/M/MV5BMzI1YzlkYWEtOGVhZS00YjNiLTk3YzYtNTFmMWJjYzFkOGM5XkEyXkFqcGc@._V1_SX300.jpg"
    },
    {
        "Title": "Attack on Titan: Part 2",
        "Year": "2015",
        "imdbID": "tt4294052",
        "Type": "movie",
        "Poster": "https://m.media-amazon.com/images/M/MV5BYmEzNmYyMDYtYmFkYy00OGNkLTkyYmQtMDA2ZTE2OTkyYmFhXkEyXkFqcGc@._V1_SX300.jpg"
    },
    {
        "Title": "Attack on Titan: Crimson Bow and Arrow",
        "Year": "2014",
        "imdbID": "tt3646944",
        "Type": "movie",
        "Poster": "https://m.media-amazon.com/images/M/MV5BYmJlYjJlZWItOTBiMy00NzZhLTllNGItYjM1NjFmNjYwZWI1XkEyXkFqcGc@._V1_SX300.jpg"
    },
    {
        "Title": "Attack on Titan",
        "Year": "2022",
        "imdbID": "tt22408766",
        "Type": "movie",
        "Poster": "https://m.media-amazon.com/images/M/MV5BM2JmZGNmNTItMGNiZC00YWU2LTg2NDctZThkNWM1YmY4MzcwXkEyXkFqcGc@._V1_SX300.jpg"
    }
   
];export default function PreviouslyWatched() {
    return (
      <div className="bg-gray-900 h-screen px-4 sm:px-4 grid grid-rows-12 grid-cols-5 gap-1">
        {/* <div className="row-span-1 col-span-5"></div> Don't remove this */}
        
        <div className="row-span-1 col-span-5 text-white font-bold text-3xl  self-end mb-4">
         
        </div>
        
        <div className="row-span-5 col-span-5 flex items-center justify-start overflow-x-auto overflow-y-hidden space-x-4 px-4">
          {recentlyWatched && recentlyWatched.map((item) => (
            <Show key={item.imdbID} item={item} />
          ))}
        </div>
        
        <div className="row-span-1 col-span-5 text-white font-bold text-2xl md:text-3xl self-end mb-4 mt-8 ml-1">
          Recently Watched
        </div>
        
        <div className="row-span-5 col-span-5 flex items-center justify-start overflow-x-auto overflow-y-hidden space-x-4 px-4">
          <div className="flex space-x-4">
            {WatchLater && WatchLater.map((item) => (
              <Show key={item.imdbID} item={item} />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
