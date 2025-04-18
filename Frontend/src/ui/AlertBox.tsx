import { ReactNode, cloneElement, createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';

import { motion } from 'framer-motion';

import { useOutsideClick } from '../hooks/useOutsideClick';

interface AlertboxContextType {
  isOpen: string;
  close: () => void;
  open: (opens: string) => void;
}
const AlertBoxContext = createContext<AlertboxContextType | undefined>(undefined);

export const useAlertBox = () => {
  const context = useContext(AlertBoxContext);
  if (!context) {
    throw new Error('useAlertBox must be used within a context provider');
    return;
  } else return context;
};

export default function AlertBox({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState('');
  const open = (opens: string) => setIsOpen(opens);
  const close = () => setIsOpen('');
  return (
    <AlertBoxContext.Provider value={{ isOpen, close, open }}>{children}</AlertBoxContext.Provider>
  );
}

function Open({ children, opens }: { children: ReactNode; opens: string }) {
  //@ts-expect-error - Environment variable type is not defined
  const { open } = useAlertBox();
  const handleClick = () => open(opens);
  return cloneElement(children as React.ReactElement, { onClick: handleClick });
}

function Window({ children, name }: { children: ReactNode; name: string }) {
  //@ts-expect-error - Environment variable type is not defined
  const { isOpen, close } = useAlertBox();
  const ref = useOutsideClick(close);
  if (name !== isOpen) return null;
  return createPortal(
    <motion.div
      initial={{ y: '-10%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '-100%', opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed inset-0 w-full h-screen bg-opacity-5 backdrop-blur-0 z-[1000] flex items-start justify-center"
    >
      <div
        ref={ref}
        className="flex flex-col w-auto h-auto max-w-full max-h-full bg-slate-200 dark:bg-slate-800 rounded shadow-lg overflow-auto items-end justify-end"
      >
        <div
          className="fixed z-10 self-end p-1 hover:bg-opacity-45 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-sm m-2 text-slate-700 dark:text-slate-300 text-3xl cursor-pointer flex"
          onClick={close}
        >
          <div className="text-base p-1">GOT IT</div>
        </div>
        <div className="px-0">{cloneElement(children as React.ReactElement, { close })}</div>
      </div>
    </motion.div>,
    document.body
  );
}

AlertBox.open = Open;
AlertBox.window = Window;
