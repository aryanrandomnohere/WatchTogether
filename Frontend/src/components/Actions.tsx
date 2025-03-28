import { ReactNode } from "react";

export default function Actions({children, handleClick}:{children:ReactNode, handleClick?:()=>void}) {
  return (
     <div className="w-full hover:cursor-pointer" onClick={handleClick}>{children}</div>
  )
}
