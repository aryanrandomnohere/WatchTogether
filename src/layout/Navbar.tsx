import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(`/query/${query}`);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-700 text-yellow-600 font-bold w-full p-3 shadow-lg shadow-white">
      <div className="flex items-center mb-2 sm:mb-0">
        <img src="../../public/h.png" alt="Logo" className="h-8 w-8 sm:h-10 sm:w-10 ml-2 sm:ml-5" />
        <p className="ml-3 text-lg sm:text-xl">WatchTogether</p>
      </div>

      <form onSubmit={handleSearch} className="w-full sm:w-auto flex justify-center">
        <input
          className="w-full sm:w-64 bg-white bg-opacity-10 text-stone-300 rounded px-3 py-2 sm:py-1 placeholder-stone-400"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for anime/show"
        />
      </form>

      <p className="hidden sm:block font-extralight hover:cursor-pointer mt-2 sm:mt-0 mr-2 sm:mr-5 text-center">
        Watch the greatest anime of all time
      </p>
    </div>
  );
}
