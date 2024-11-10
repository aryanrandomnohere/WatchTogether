import { MouseEvent, ReactNode } from "react";

export default function Button({children,w,onClick}: {children:ReactNode,w:string,onClick?:(event: MouseEvent<HTMLButtonElement>)=>void }) {
  return (
    <button onClick={onClick} className={`py-2 px-${w} bg-opacity-0  border border-yellow-600 rounded text-yellow-600 hover:bg-yellow-600 hover:text-white`}>{children}</button>
  )
}
