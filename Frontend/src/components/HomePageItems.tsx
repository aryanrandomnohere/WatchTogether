// import { isAuthenticatedState } from "../State/authState";
// import { useRecoilValue } from "recoil";
// import Modal from "../ui/Modal";
// import Authentication from "../pages/Authentication";
// import PreviouslyWatched from "./PreviouslyWatched";


// export default function HomePageItems() {
//   const isAuthenticated = useRecoilValue(isAuthenticatedState);

//   return (a
//     <>
//       {isAuthenticated ? (
//         <PreviouslyWatched/>
//       ) : (
//         <div className=" fixed inset-0 w-full h-screen bg-slate-950 bg-opacity-20 backdrop-blur-md z-[1000] transition-all duration-500 flex items-center justify-center p-1">
        
//           <div className="text-white text-center">
//             Please log in to access your home page content.
//             <div className="mb-12">
//             <Modal>
//          <Modal.open opens="signIn">
//            <div><a className="mt-10 ml-2 underline text-blue-800 text-lg cursor-pointer ">
//     Login</a></div>
//          </Modal.open>
//          <Modal.window name="signIn">
//            <Authentication />
//          </Modal.window>
//        </Modal>
//        </div>
//        <div>.....</div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
