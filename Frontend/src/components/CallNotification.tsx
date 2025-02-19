import { toast } from "react-hot-toast";

const CallNotification = ({ msg, isJoined, setIsJoined, t }:{msg:string,isJoined:boolean,setIsJoined:(arg0:boolean)=>void, t:any}) => {
  return (
    <div className="flex flex-row items-center justify-between bg-slate-800 text-white p-1.5 gap-2 rounded-lg shadow-lg ">
      <div className="text-base font-medium">{msg}</div>

      <div className="flex gap-3">
        <button
          onClick={() => {
            setIsJoined(false);
            toast.error("Call Cancelled");
            toast.dismiss(t.id);
          }}
          className="px-3 py-1 text-sm font-semibold text-red-500 border border-red-500 rounded-md hover:bg-red-500 hover:text-white transition duration-200"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            setIsJoined(true);
            console.log(isJoined);
            toast.success("Call Joined");
            toast.dismiss(t.id);
          }}
          className="px-3 py-1 text-sm font-semibold text-green-500 border border-green-500 rounded-md hover:bg-green-500 hover:text-white transition duration-200"
        >
          Join
        </button>
      </div>
    </div>
  );
};

export default CallNotification;