import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import n from "./n.png"; // Correctly import the image
import useAuth from "../hooks/useAuth";
import Button from "../ui/Button";
import { useRecoilValue } from "recoil";
import { isAuthenticatedState } from "../State/authState";
import Modal from "../ui/Modal";
import Authentication from "../pages/Authentication";



export default function Navbar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const {logout} = useAuth();
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(`/query/${query}`);
  }
  const isAuthenticated = useRecoilValue(isAuthenticatedState);

  return (<div className="relative ">
    <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-950 text-yellow-600 font-bold w-full shadow-yellow-950 shadow-md mb-10 fixed">
      <Link to="/">
        <div className="flex items-center mb-2 sm:mb-0 my-2 sm:my-0">
          <img src={n} alt="Logo" className="h-8 w-8 sm:h-10 sm:w-10 ml-2 sm:ml-8" />
          <p className="ml-3 text-lg sm:text-xl">WatchAlong</p>
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
      { !isAuthenticated && <div className="hidden sm:hidden lg:block mr-8 ">
<Modal>
      <Modal.open opens="signIn">
            <div className="mr-3"><Button w="4">
        Login
        </Button></div>
          </Modal.open>
          <Modal.window name="signIn">
            <Authentication />
          </Modal.window>
        </Modal></div>}
     
      {isAuthenticated && <div className="hidden sm:hidden lg:block mr-8 "> <Button w="4" onClick={logout}>Logout</Button></div>}
    </div>
    </div>
  );
}
