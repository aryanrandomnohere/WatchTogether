import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
//@ts-ignore
import n from "./n.png";
import Button from "../ui/Button";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
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
import { Friends } from "../State/friendsState";
import { FriendRequests } from "../State/FriendRequests";

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

  useEffect(() => {
    if (isAuthenticated) {
     


    async function loadRequests() {
      //@ts-ignore
      const response =   await axios.get(`${import.meta.env.VITE_BACKEND_APP_API_BASE_URL}/api/v1/social/loadrequests`, {
        headers: {
          authorization: localStorage.getItem("token"),
        },
      })
      setFriendRequests(response.data.noti);
    }
    loadRequests();

        async function loadFriends(){
          //@ts-ignore
      const response =   await axios.get(`${import.meta.env.VITE_BACKEND_APP_API_BASE_URL}/api/v1/social/friends`, {
          headers: {
            authorization: localStorage.getItem("token"),
          },
        })
         setFriends(response.data.actualFriends);
         
        }
        loadFriends();
 
          async function fetchUserData() {
          try {
            //@ts-ignore
          const response = await axios.get(`${import.meta.env.VITE_BACKEND_APP_API_BASE_URL}/api/v1/user/getuser`, {
            headers: {
              authorization: localStorage.getItem("token") || ""
            }
          });
         
          const { id, username, email, displayname,avatar }: UserInfoType = response.data.userWithMovies;
          setUserInfo({ id, username, email, displayname,avatar });
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      fetchUserData();
    }
  }, [isAuthenticated, setUserInfo, setFriends,setFriendRequests, UserInfo.id]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(`/query/${query}`);
  }

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row items-center justify-center w-full backdrop-filter backdrop-blur bg-opacity-30  text-slate-400 font-bold z-10 fixed  bg-transparent">
        
          <div className="flex w-full items-center  justify-between">  
         
            <div className="flex w-full justify-between items-center ">
            <Link to="/"> <div className="flex items-center"><p className=" ml-4 md:ml-8 my-1.5 text-2xl sm:text-3xl font-comic font-light ">WatchAlong</p></div></Link>
            <div className="sm:hidden right-11 mr-2.5">
              {!isAuthenticated ?<div>
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
          </div> :<Sidebar>
              <Sidebar.open>
                <TbLayoutSidebarRight className="text-3xl hover:cursor-pointer text-slate-400 font-extralight" />
              </Sidebar.open>
              <Sidebar.window>
                  {!isNotiOpenValue ?<SideBar/> : <Notifications/>}
              </Sidebar.window>
            </Sidebar>}
            </div>
            </div>
          </div>
        
        <form onSubmit={handleSearch} className="w-full sm:w-full flex justify-between md:mr-44">
          <input
            className="w-full  md:min-w-96   md:w-150 bg-white bg-opacity-10 text-stone-300 rounded px-3 py-1 sm:py-1.5 sm:my-1 placeholder-stone-400 border-solid border border-slate-400 focus:outline-none mx-0.5"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for anime/show"
          />
        </form><div>
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
                <TbLayoutSidebarRight className="text-3xl hover:cursor-pointer text-slate-400 font-extralight" />
              </Sidebar.open>
              <Sidebar.window>
                {!isNotiOpenValue ? <SideBar /> : <Notifications/>}
              </Sidebar.window>
            </Sidebar>
          </div>
        )}</div>
      </div>
    </div>
  );
}
