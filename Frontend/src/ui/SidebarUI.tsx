import React, { cloneElement, createContext, ReactNode, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { TbLayoutSidebarRight } from "react-icons/tb";
import { useOutsideClick } from "../hooks/useOutsideClick";
import {motion} from "framer-motion"

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
    <motion.div
      className="fixed inset-0 h-screen z-10 flex justify-end  pb-1"
      initial={{ x: '50%' }} // Start off-screen from the right
      animate={{ x: isOpen ? 0 : '50%' }} // Move in from the right when open, and back when closed
      
      exit={{ x: '100%' }} // Ensure it goes fully off-screen to the right
      transition={{ type: 'string', stiffness: 300, damping: 10, duration:0.5}} // Smooth spring effect
    >
      {/* Sidebar Panel with smoother sliding animation */}
      <div
        ref={ref} // Attach ref to the main container to detect outside clicks
        className={`flex flex-col border-l border-yellow-600 dark:border-slate-400 overflow-hidden w-80 h-screen max-w-full max-h-screen bg-slate-200 dark:bg-gray-900 rounded-xl shadow-lg z-20`}
      >
        <div
          className="flex w-full justify-between self-start p-2 text-slate-600 dark:text-slate-400 text-3xl cursor-pointer"
        >
          <div onClick={toggle}><TbLayoutSidebarRight /></div>
        </div>
        <div className="px-0">
          {React.cloneElement(children as React.ReactElement, { toggle })}
        </div>
      </div>

      {/* Transparent Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none"></div>
    </motion.div>,
    document.body
  );
}

Sidebar.open = Open;
Sidebar.window = Window;
