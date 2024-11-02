import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  function handleClick() {
    navigate("/nowwatching");
  }

  return (
    <div className="flex flex-col bg-gray-900 h-screen justify-center items-center px-4 sm:px-6 lg:flex-row lg:justify-between">
      <button
        className="mt-4 text-white px-4 py-2 bg-gray-700 rounded-lg shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
        onClick={handleClick}
      >
        Room
      </button>
    </div>
  );
}
