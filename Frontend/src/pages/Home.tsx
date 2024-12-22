
import { isAuthenticatedState } from "../State/authState";
import { useRecoilValue } from "recoil";
import HomePageItems from "../components/HomePageItems";
import PreviouslyWatched from "../components/PreviouslyWatched";
import SlideShow from "../components/SlideShow";
export default function Home() {
  // Check if the user is authenticated

  // const {login} = useAuth();
const isAuthenticated = useRecoilValue(isAuthenticatedState);

  return (
    <div className="sm:mt-12 mt-28">
    <div className="hidden"><SlideShow/></div>
      {!isAuthenticated ? (<div className="">
        <HomePageItems/>
        <PreviouslyWatched/>
</div>
      ) : (
        <HomePageItems/>
      )}
      
    </div>
  );
}
