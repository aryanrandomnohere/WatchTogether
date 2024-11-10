
import { isAuthenticatedState } from "../State/authState";
import { useRecoilValue } from "recoil";
import HomePageItems from "../components/HomePageItems";
import PreviouslyWatched from "../components/PreviouslyWatched";
export default function Home() {
  // Check if the user is authenticated

  // const {login} = useAuth();
const isAuthenticated = useRecoilValue(isAuthenticatedState);

  return (
    <>
      {!isAuthenticated ? (<div>
        <HomePageItems/>
        <PreviouslyWatched/>
</div>
      ) : (
        <HomePageItems/>
      )}
    </>
  );
}
