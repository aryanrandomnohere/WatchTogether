import React, { cloneElement, createContext, ReactNode, useContext, useState } from "react";
import { createPortal } from "react-dom";
// import Button from "./Button";
import { HiXMark } from "react-icons/hi2";
// import { useOutsideClick } from "../hooks/useOutsideClick";

// Define a context type
interface ModalContextType {
  openName: string;
  close: () => void;
  open: (name: string) => void;
}

// Create a context with a default value
const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

export default function Modal({ children }: { children: ReactNode }) {
  const [openName, setIsOpenName] = useState<string>("");

  const close = () => setIsOpenName("");
  const open = (name: string) => setIsOpenName(name);

  return (
    <ModalContext.Provider value={{ openName, close, open }}>
      {children}
    </ModalContext.Provider>
  );
}

interface OpenProps {
  children: ReactNode;
  opens: string;
}

function Open({ children, opens }: OpenProps) {
  const { open } = useModal(); // Using the custom hook to access the context

  const handleClick = () => open(opens);

  return cloneElement(children as React.ReactElement, { onClick: handleClick });
}

interface WindowProps {
  children: ReactNode;
  name: string;
}

function Window({ children, name }: WindowProps) {
  const { openName, close } = useModal(); // Using the custom hook to access the context

  if (name !== openName) return null;
  
  // const ref = useOutsideClick(close, true);

  return createPortal(
    <div
  
      className="fixed inset-0 w-full h-screen bg-slate-950 bg-opacity-20 backdrop-blur-sm z-[1000] transition-all duration-500 flex items-center justify-center p-1"
    >
      <div className="flex flex-col w-full max-w-md bg-gray-950 rounded-lg shadow-lg">
        <div className="self-end p-2 text-orange-600 text-3xl cursor-pointer" onClick={close}>
          <HiXMark />
         </div>
        <div className="px-5">
        {children}</div>
      </div>
    </div>,
    document.body
  );
}

Modal.open = Open;
Modal.window = Window;
