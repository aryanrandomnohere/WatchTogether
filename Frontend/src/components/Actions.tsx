import { ReactNode } from "react";

export default function Actions({children, handleClick}:{children:ReactNode, handleClick?:()=>void}) {
  return (
     <div className="flex gap-2  hover:text-slate-400 hover:cursor-pointer items-center font-extralight  text-lg" onClick={handleClick}>{children}</div>
  )
}
