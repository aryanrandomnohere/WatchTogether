import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import n from "./n.png"; // Correctly import the image

export default function Navbar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(`/query/${query}`);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-950 text-yellow-600 font-bold w-full shadow-yellow-950 shadow-md mb-10 fixed">
      <Link to="/">
        <div className="flex items-center mb-2 sm:mb-0 my-2 sm:my-0">
          <img src={n} alt="Logo" className="h-8 w-8 sm:h-10 sm:w-10 ml-2 sm:ml-5" />
          <p className="ml-3 text-lg sm:text-xl">WatchTogether</p>
        </div>
      </Link>
      <form onSubmit={handleSearch} className="w-full sm:w-auto flex justify-center">
        <input
          className="w-full sm:w-96 bg-white bg-opacity-10 text-stone-300 rounded px-3 py-1 sm:py-1 sm:my-2 placeholder-stone-400 border-solid border border-yellow-600 focus:outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for anime/show"
        />
      </form>

      <Link to="/nowwatching">
        <p className="hidden sm:block font-extralight hover:cursor-pointer mt-2 sm:mt-0 mr-2 sm:mr-5 text-center border border-orange-600 py-1 px-2">
          Room
        </p>
      </Link>
    </div>
  );
}
