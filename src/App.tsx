import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./pages/Home"
import Applayout from "./layout/Applayout";
import Room from "./pages/Room";
import ShowsDisplay from "./pages/ShowsDisplay";


export default function App() {
  return (
    <BrowserRouter> <Routes>  
     
      <Route path="/" element={<Applayout/>}>
      <Route path="/" element={<Home/>}/>
      <Route path="/nowwatching" element={<Room />}/>
      <Route path="/query/:id" element={<ShowsDisplay />}/>
      <Route path="/nowwatching/:id" element={<Room />}/>
    </Route>
      </Routes>
      </BrowserRouter>
  )
}
