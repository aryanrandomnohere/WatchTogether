import { ReactNode } from "react";

export default function Actions({children, handleClick}:{children:ReactNode, handleClick?:()=>void}) {
  return (
     <div className="flex gap-2  hover:text-yellow-600 hover:cursor-pointer items-center font-extralight  text-lg" onClick={handleClick}>{children}</div>
  )
}
