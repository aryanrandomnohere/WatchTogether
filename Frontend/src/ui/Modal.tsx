import React, { cloneElement, createContext, ReactNode, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { HiXMark } from "react-icons/hi2";
import { useOutsideClick } from "../hooks/useOutsideClick";

interface ModalContextType {
  openName: string;
  close: () => void;
  open: (name: string) => void;
}

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
  const { open } = useModal();

  const handleClick = () => open(opens);

  return cloneElement(children as React.ReactElement, { onClick: handleClick });
}

interface WindowProps {
  children: ReactNode;
  name: string;
}

function Window({ children, name }: WindowProps) {
  const { openName, close } = useModal();
  const ref = useOutsideClick(close)
  if (name !== openName) return null;

  return createPortal(
    <div className="fixed inset-0 w-full h-screen bg-slate-950 bg-opacity-20 backdrop-blur-sm z-[1000] transition-all duration-500 flex items-center justify-center p-1">
      <div ref={ref} className="flex flex-col w-auto h-auto max-w-full max-h-full bg-gray-900 rounded-xl shadow-lg overflow-auto">
        <div className="fixed z-10 self-end p-2 text-orange-600 text-3xl cursor-pointer" onClick={close}>
          <HiXMark />
        </div>
        <div className="px-0">
          {cloneElement(children as React.ReactElement, { close })}
        </div>
      </div>
    </div>,
    document.body
  );
}

Modal.open = Open;
Modal.window = Window;
