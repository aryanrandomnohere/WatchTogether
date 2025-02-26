import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";


export default function Invite({t,from,fromId}:{t:any,from:string,fromId:string}) {
    const navigate = useNavigate()
  return (
    <div
    className={`${
      t.visible ? 'animate-enter' : 'animate-leave'
    } max-w-md w-full bg-slate-800 shadow-lg rounded-lg pointer-events-auto flex justify-center items-center ring-1 ring-black  ring-opacity-5`}
  >
    <div className="flex-1 items-center w-0 p-2">
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          {/* Avatar or image goes here */}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-slate-400">{from}</p>
          <p className="text-sm text-gray-200">
            has requested to join your room
          </p>
        </div>
      </div>
    </div>
    <div className="flex border-l border-gray-200">
      <button
        onClick={() => toast.dismiss(t.id)}
        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Cancel
      </button>
    </div>
    <div className="flex border-l border-gray-200">
      <button
        onClick={() => {
          toast.dismiss(t.id);
          navigate(`/watch/${fromId}`);
        }}
        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Accept
      </button>
    </div>
  </div>
  )
}
