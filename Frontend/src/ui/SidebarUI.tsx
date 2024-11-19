import React, { cloneElement, createContext, ReactNode, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { TbLayoutSidebarRight } from "react-icons/tb";
import { useOutsideClick } from "../hooks/useOutsideClick";


interface ModalContextType {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const sideBarContext = createContext<ModalContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(sideBarContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

export default function Sidebar({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggle = () => setIsOpen((state) => !state);
  const close = () => setIsOpen(false); // Update close function to always close

  return (
    <sideBarContext.Provider value={{ isOpen, toggle, close }}>
      {children}
    </sideBarContext.Provider>
  );
}

interface OpenProps {
  children: ReactNode;
}

function Open({ children }: OpenProps) {
  const { toggle } = useSidebar();

  const handleClick = () => toggle();

  return cloneElement(children as React.ReactElement, { onClick: handleClick });
}

interface WindowProps {
  children: ReactNode;
}

function Window({ children }: WindowProps) {
  const { isOpen, toggle, close } = useSidebar();
  const ref = useOutsideClick(close, true);
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 h-screen z-10 flex justify-end px-1 pb-1">
      {/* Sidebar Panel with smoother sliding animation */}
      <div
        ref={ref} // Attach ref to the main container to detect outside clicks
        className={`flex flex-col border-l border-yellow-600 overflow-hidden w-80 h-screen max-w-full max-h-screen bg-gray-900 rounded-xl shadow-lg z-20 transform transition-all duration-500 ease-out ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div
          className="flex w-full justify-between self-start p-2 text-orange-600 text-3xl cursor-pointer"
          
        >
          <div onClick={toggle}><TbLayoutSidebarRight /></div>
        </div>
        <div className="px-0">
          {cloneElement(children as React.ReactElement, { toggle })}
        </div>
      </div>

      {/* Transparent Overlay */}
      <div className="absolute inset-0 bg-black opacity-30 z-10 pointer-events-none"></div>
    </div>,
    document.body
  );
}

Sidebar.open = Open;
Sidebar.window = Window;
