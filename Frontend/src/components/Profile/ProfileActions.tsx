import { useState } from "react";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { userInfo } from "../../State/userState";
// Importing avatars properly
import avatar1 from "./avatar1.png";
import avatar2 from "./avatar2.png";
import avatar3 from "./avatar3.png";
import avatar4 from "./avatar4.png";
import toast from "react-hot-toast";
import { MdModeEdit } from "react-icons/md";




const avatars = { avatar1, avatar2, avatar3, avatar4};

export default function ProfileAction() {
  const Info = useRecoilValue(userInfo);
  const [displayName, setDisplayName] = useState(Info.displayname);
  const [selectedPfp, setSelectedPfp] = useState(Info.avatar);
  const [loading, setLoading] = useState(false);
 const [isOpenAvatar, setIsOpenAvatar] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_BACKEND_APP_API_BASE_URL;
  const token = localStorage.getItem("token");

  // Handle Display Name Change
  const handleUpdateDisplayName = async () => {
    try {
      setLoading(true);
      await axios.put(
        `${API_BASE_URL}/api/v1/user/updateDisplayName`, 
        { newDisplayName: displayName },
        { headers: { Authorization: token } }
      );
      toast.error("Display name updated successfully!");
    } catch (error) {
      console.error("Error updating display name:", error);
      toast.error("Failed to update display name.");
    } finally {
      setLoading(false);
    }
  };

  // Handle PFP Change
  const handleChangePfp = async (newPfp: string) => {
    try {
      setSelectedPfp(newPfp);
      await axios.put(
        `${API_BASE_URL}/api/v1/user/updateAvatar`, 
        { avatar: newPfp },
        { headers: { Authorization: token } }
      );
      toast.error("Profile picture updated!");
    } catch (error) {
      console.error("Error updating avatar:", error);
      toast.error("Failed to update avatar.");
    }
  };

  const pfpOptions = Object.values(avatars);

  return (
    <div className="m-5 rounded-lg h-96 text-white">
     

      {/* User Info */}
      <div className="flex items-center justify-center gap-4 mt-4">
      <div className="relative  avatar">
  <div className="w-24 rounded-full border-2">
    <img src={selectedPfp || avatar2} />
  </div>
  <div className="absolute bottom-0 right-0 p-1 border rounded-full bg-white text-yellow-600 hover:cursor-pointer" onClick={()=>setIsOpenAvatar(!isOpenAvatar)}><MdModeEdit /></div>
  
</div>

        {/* <div>
          <div className="text-lg font-semibold">{Info.username}</div>
          <div className="text-sm text-gray-300">{Info.email}</div>
        </div> */}
      </div>
      {isOpenAvatar &&  <div className="absolute mt-4 bg-slate-950 p-1.5 flex flex-col items-center">
        <label className=" block text-yellow-600">Choose Profile Picture</label>
        <div className="flex gap-3 mt-2">
          {pfpOptions.map((pfp, index) => (
            <img
              key={index}
              src={pfp}
              alt="PFP Option"
              className={`w-12 h-12 cursor-pointer border-2 ${
                selectedPfp === pfp ? "border-yellow-600" : "border-transparent"
              }`}
              onClick={() => handleChangePfp(pfp)}
            />
          ))}
        </div>
      </div>}
      {/* Change Display Name */}
      <div className="flex gap-4 mt-4">
        <div>
        <label className="block text-yellow-600 text-sm">Display Name</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full px-2 mt-1 text-white  bg-transparent"
        />
      
        </div>
        <div className="flex flex-col"><label className="text-yellow-600 text-sm">Username</label>
        <input value={Info.username} className="bg-transparent "/></div>
      
         
      </div>
      <div className="flex flex-col"><label className="text-sm text-yellow-600">Email</label><input className="bg-transparent " value={Info.email}/></div>

      {/* Choose Profile Picture */}
     
    </div>
  );
}

