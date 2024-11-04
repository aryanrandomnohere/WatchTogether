import Authentication from "./Authentication";
import Modal from "../ui/Modal";


export default function Home() {
  // Check if the user is authenticated
  const isAuthenticated = localStorage.getItem("token");

  return (
    <>
      {isAuthenticated ? (
     <div className="flex justify-center items-start bg-gray-900 h-screen px-4 sm:px-6 "><Modal>
          <Modal.open opens="signIn">
            <div className="mt-10 text-yellow-600 cursor-pointer ">
         SignIn Into your account to Track Your Shows</div>
          </Modal.open>
          <Modal.window name="signIn">
            <Authentication />
          </Modal.window>
        </Modal> </div>

      ) : (
        <div className="bg-gray-900 h-screen px-4 sm:px-6 grid grid-rows-2 gap-4">
          <div className="bg-gray-800 row-span-1 flex items-center justify-center">
            {/* Additional content can go here */}
            Welcome to the Home Page!
          </div>
          <div className="bg-gray-700 row-span-1 flex items-center justify-center">
            Favourite
          </div>
        </div>
      )}
    </>
  );
}
