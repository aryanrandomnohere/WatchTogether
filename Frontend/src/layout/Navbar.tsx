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
import { isNotiOpen } from "../State/notificationPanel";
import Notifications from "../components/Notifications";

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
  const isNotiOpenValue = useRecoilValue(isNotiOpen);

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
      <div className="flex flex-col sm:flex-row items-center w-full bg-slate-950 text-yellow-600 font-bold shadow-yellow-950 shadow-md mb-10 fixed">
        
          <div className="flex w-full items-center mb-2 sm:mb-0 my-2 sm:my-0 justify-between">
         
            <div className="flex w-full justify-between items-center ">
            <Link to="/"> <div className="flex items-center"><img src={n} alt="Logo" className="h-10 w-10 sm:h-12 sm:w-12 ml-2 sm:ml-8" /><p className="ml-2 text-2xl sm:text-3xl font-comic ">WatchAlong</p></div></Link>
            <div className="sm:hidden right-11 mr-6"><Sidebar>
              <Sidebar.open>
                <TbLayoutSidebarRight className="text-3xl hover:cursor-pointer text-yellow-600 font-extralight" />
              </Sidebar.open>
              <Sidebar.window>
                  {!isNotiOpenValue ?<SideBar/> : <Notifications/>}
              </Sidebar.window>
            </Sidebar>
            </div>
            </div>
          </div>
        
        <form onSubmit={handleSearch} className="w-full sm:w-full flex justify-between">
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
          <div className="mr-8 hidden sm:block">
            <Sidebar>
              <Sidebar.open>
                <TbLayoutSidebarRight className="text-3xl hover:cursor-pointer text-yellow-600 font-extralight" />
              </Sidebar.open>
              <Sidebar.window>
                {!isNotiOpenValue ? <SideBar /> : <Notifications/>}
              </Sidebar.window>
            </Sidebar>
          </div>
        )}
      </div>
    </div>
  );
}
