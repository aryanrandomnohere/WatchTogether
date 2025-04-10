import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { isAuthenticatedState } from "../State/authState";
import Modal from "../ui/Modal";
import Authentication from "../pages/Authentication";
import axios from "axios";
import { TbLayoutSidebarRight } from "react-icons/tb";
import { BsSun, BsMoon } from "react-icons/bs";
import Sidebar from "../ui/SidebarUI";
import SideBar from "./SideBar";
import { userInfo } from "../State/userState";
import { isNotiOpen } from "../State/notificationPanel";
import Notifications from "../components/Notifications";
import { Friends } from "../State/friendsState";
import { FriendRequests } from "../State/FriendRequests";
import { themeState } from "../State/themeState";

interface UserInfoType {
  id: string;
  username: string;
  avatar:string;
  email: string;
  displayname:string;
}

export default function Navbar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [UserInfo, setUserInfo] = useRecoilState(userInfo);
  const isAuthenticated = useRecoilValue(isAuthenticatedState);
  const isNotiOpenValue = useRecoilValue(isNotiOpen);
  const setFriends = useSetRecoilState(Friends);
  const setFriendRequests = useSetRecoilState(FriendRequests);
  const [theme, setTheme] = useRecoilState(themeState);

  useEffect(() => {
    if (isAuthenticated) {
      async function loadRequests() {
        //@ts-expect-error - Environment variable type is not defined
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_APP_API_BASE_URL}/api/v1/social/loadrequests`, {
          headers: {
            authorization: localStorage.getItem("token"),
          },
        })
        setFriendRequests(response.data.noti);
      }
      loadRequests();

      async function loadFriends(){
        //@ts-expect-error - Environment variable type is not defined
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_APP_API_BASE_URL}/api/v1/social/friends`, {
          headers: {
            authorization: localStorage.getItem("token"),
          },
        })
        setFriends(response.data.actualFriends);
      }
      loadFriends();
 
      async function fetchUserData() {
        try {
          //@ts-expect-error - Environment variable type is not defined
          const response = await axios.get(`${import.meta.env.VITE_BACKEND_APP_API_BASE_URL}/api/v1/user/getuser`, {
            headers: {
              authorization: localStorage.getItem("token") || ""
            }
          });
         
          const { id, username, email, displayname, avatar }: UserInfoType = response.data.userWithMovies;
          setUserInfo({ id, username, email, displayname, avatar });
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      fetchUserData();
    }
  }, [isAuthenticated, setUserInfo, setFriends, setFriendRequests, UserInfo.id]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(`/query/${query}`);
  }

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };


  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row items-center justify-center w-full backdrop-filter backdrop-blur bg-opacity-30 text-slate-600 dark:text-slate-300 font-bold z-10 fixed bg-slate-400/80 dark:bg-slate-950/60">
        <div className="flex w-full items-center justify-between">  
          <div className="flex w-full justify-between items-center">
            <Link to="/">
              <div className="flex items-center">
                <p className="ml-4 md:ml-8 my-1.5 text-2xl sm:text-3xl font-comic font-light">WatchAlong</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <BsMoon className="w-5 h-5 text-slate-600" />
                ) : (
                  <BsSun className="w-5 h-5 text-slate-300" />
                )}
              </button>
              <div className="sm:hidden right-11 mr-2.5">
                {!isAuthenticated ? (
                  <div>
                    <Modal>
                      <Modal.open opens="signIn">
                        <div className="">
                          <Button w="2">Login</Button>
                        </div>
                      </Modal.open>
                      <Modal.window name="signIn">
                        <Authentication />
                      </Modal.window>
                    </Modal>
                  </div>
                ) : (
                  <Sidebar>
                    <Sidebar.open>
                      <TbLayoutSidebarRight className="text-3xl hover:cursor-pointer text-slate-600 dark:text-slate-300 font-extralight" />
                    </Sidebar.open>
                    <Sidebar.window>
                      {!isNotiOpenValue ? <SideBar/> : <Notifications/>}
                    </Sidebar.window>
                  </Sidebar>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSearch} className="w-full sm:w-full flex justify-between md:mr-44">
          <input
            className="w-full md:min-w-96 md:w-150 bg-slate-200 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded px-3 py-1 sm:py-1.5 sm:my-1 placeholder-slate-400 dark:placeholder-slate-500 border-solid border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 mx-0.5"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for anime/show"
          />
        </form>
        <div>
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
                  <TbLayoutSidebarRight className="text-3xl hover:cursor-pointer text-slate-600 dark:text-slate-300 font-extralight" />
                </Sidebar.open>
                <Sidebar.window>
                  {!isNotiOpenValue ? <SideBar /> : <Notifications/>}
                </Sidebar.window>
              </Sidebar>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
