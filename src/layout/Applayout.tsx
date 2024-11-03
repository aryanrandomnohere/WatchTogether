import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Applayout() {
  return (
    <div className="flex flex-col">
      <div><Navbar/></div>
    <div className=""><Outlet/></div>
    </div>
  )
}
