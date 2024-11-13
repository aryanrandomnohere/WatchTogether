import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import n from "./n.png";
import Button from "../ui/Button";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { isAuthenticatedState } from "../State/authState";
import Modal from "../ui/Modal";
import Authentication from "../pages/Authentication";
import axios from "axios";
import { TbLayoutSidebarRight } from "react-icons/tb";
import Sidebar from "../ui/SidebarUI";
import SideBar from "./SideBar";
import { userInfo } from "../State/userState";

interface UserInfoType {
  id: string;
  username: string;
  email: string;
  firsname: string;
  lastname: string;
}

export default function Navbar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const setUserInfo = useSetRecoilState(userInfo);
  const isAuthenticated = useRecoilValue(isAuthenticatedState);

  useEffect(() => {
    if (isAuthenticated) {
      async function fetchUserData() {
        try {
          const response = await axios.get("http://localhost:3000/api/v1/user/getuser", {
            headers: {
              authorization: localStorage.getItem("token") || ""
            }
          });
          const { id, username, email, firsname, lastname }: UserInfoType = response.data.userWithMovies;
          setUserInfo({ id, username, email, firsname, lastname });
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      fetchUserData();
    }
  }, [isAuthenticated, setUserInfo]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(`/query/${query}`);
  }

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-950 text-yellow-600 font-bold w-full shadow-yellow-950 shadow-md mb-10 fixed">
        <Link to="/">
          <div className="flex items-center mb-2 sm:mb-0 my-2 sm:my-0">
            <img src={n} alt="Logo" className="h-8 w-8 sm:h-10 sm:w-10 ml-2 sm:ml-8" />
            <p className="ml-2 text-lg sm:text-2xl font-comic">WatchAlong</p>
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
        {!isAuthenticated ? (
          <div className="hidden sm:hidden lg:block mr-8">
            <Modal>
              <Modal.open opens="signIn">
                <div className="mr-3">
                  <Button w="4">Login</Button>
                </div>
              </Modal.open>
              <Modal.window name="signIn">
                <Authentication />
              </Modal.window>
            </Modal>
          </div>
        ) : (
          <div className="mr-8">
            <Sidebar>
              <Sidebar.open>
                <TbLayoutSidebarRight className="text-3xl hover:cursor-pointer text-yellow-600 font-extralight" />
              </Sidebar.open>
              <Sidebar.window>
                <SideBar />
              </Sidebar.window>
            </Sidebar>
          </div>
        )}
      </div>
    </div>
  );
}
