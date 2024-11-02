import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Applayout() {
  return (
    <div><Navbar/>
    <Outlet/>
    </div>
  )
}
