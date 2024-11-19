import axios from "axios";
import { IoMdCheckmark } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";

export default function RequestActions({id}:{id:string}) {
  console.log(id);
  function handleRejection(){
    axios.put("http://localhost:3000/api/v1/social/rejectrequest",{from:id},{
      headers:{
        authorization: localStorage.getItem("token"),
      }
    })
  }
  return (

    <div className="flex items-center gap-4"><div onClick={handleRejection}><RxCross2 className="text-yellow-600 text-xl hover:cursor-pointer hover:text-yellow-800" /></div><IoMdCheckmark className="text-xl hover:cursor-pointer hover:text-yellow-800  text-yellow-600"/></div>
  )
}
