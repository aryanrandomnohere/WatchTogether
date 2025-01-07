import { useState } from "react";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { userInfo } from "../State/userState";

// Importing avatars properly
import avatar1 from "../../assets/avatars/avatar1.jpeg";
import avatar2 from "../../assets/avatars/avatar2.jpeg";
import avatar3 from "../../assets/avatars/avatar3.jpeg";
import avatar4 from "../../dist/assets/avatars/avatar4.jpeg";
import avatar5 from "../../dist/assets"


const avatars = { avatar1, avatar2, avatar3, avatar4, avatar5 };

export default function ProfileAction() {
  const Info = useRecoilValue(userInfo);
  const [displayName, setDisplayName] = useState(Info.displayname);
  const [selectedPfp, setSelectedPfp] = useState(Info.avatar);
  const [loading, setLoading] = useState(false);

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
      alert("Display name updated successfully!");
    } catch (error) {
      console.error("Error updating display name:", error);
      alert("Failed to update display name.");
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
      alert("Profile picture updated!");
    } catch (error) {
      console.error("Error updating avatar:", error);
      alert("Failed to update avatar.");
    }
  };

  const pfpOptions = Object.values(avatars);

  return (
    <div className="m-5 bg-slate-800 p-5 rounded-lg text-white">
      <h2 className="text-yellow-600 text-xl font-bold">Profile Settings</h2>

      {/* User Info */}
      <div className="flex items-center gap-4 mt-4">
        <img src={selectedPfp} alt="Profile" className="w-16 h-16 rounded-full border-2 border-yellow-600" />
        <div>
          <div className="text-lg font-semibold">{Info.username}</div>
          <div className="text-sm text-gray-300">{Info.email}</div>
        </div>
      </div>

      {/* Change Display Name */}
      <div className="mt-4">
        <label className="block text-yellow-600">Change Display Name</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full p-2 mt-1 text-black rounded bg-white"
        />
        <button
          onClick={handleUpdateDisplayName}
          className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Updating..." : "Save"}
        </button>
      </div>

      {/* Choose Profile Picture */}
      <div className="mt-4">
        <label className="block text-yellow-600">Choose Profile Picture</label>
        <div className="flex gap-3 mt-2">
          {pfpOptions.map((pfp, index) => (
            <img
              key={index}
              src={pfp}
              alt="PFP Option"
              className={`w-12 h-12 rounded-full cursor-pointer border-2 ${
                selectedPfp === pfp ? "border-yellow-600" : "border-transparent"
              }`}
              onClick={() => handleChangePfp(pfp)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

