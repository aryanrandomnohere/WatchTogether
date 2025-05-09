import React, { ReactNode, cloneElement, createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { HiXMark } from 'react-icons/hi2';

// import { useOutsideClick } from "../hooks/useOutsideClick";
import { motion } from 'framer-motion';

interface ModalContextType {
  openName: string;
  close: () => void;
  open: (name: string) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export default function Modal({ children }: { children: ReactNode }) {
  const [openName, setIsOpenName] = useState<string>('');

  const close = () => setIsOpenName('');
  const open = (name: string) => setIsOpenName(name);

  return (
    <ModalContext.Provider value={{ openName, close, open }}>{children}</ModalContext.Provider>
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
  // const ref = useOutsideClick(close)
  if (name !== openName) return null;

  return createPortal(
    <motion.div
      initial={{ y: '-10%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '-100%', opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed inset-0 w-full h-screen bg-slate-950/20 dark:bg-slate-950/20 backdrop-blur-sm z-[1000] flex items-center justify-center p-1"
    >
      <div className="flex flex-col w-auto h-auto max-w-full max-h-full bg-slate-200 dark:bg-gray-900 rounded-lg shadow-2xl overflow-auto ">
        <div
          className="fixed z-10 self-end p-1 hover:bg-slate-300 dark:hover:bg-slate-800/50 rounded-full text-slate-700 dark:text-orange-600 text-3xl cursor-pointer transition-all duration-300"
          onClick={close}
        >
          <HiXMark />
        </div>
        <div className="px-0">{cloneElement(children as React.ReactElement, { close })}</div>
      </div>
    </motion.div>,
    document.body
  );
}

Modal.open = Open;
Modal.window = Window;
