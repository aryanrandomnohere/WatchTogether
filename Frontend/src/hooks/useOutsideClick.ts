import { useEffect, useRef } from "react";

export function useOutsideClick(close: () => void, listenCapturing = true) {
  const ref = useRef<HTMLDivElement>(null); // Use HTMLDivElement

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        close();
      }
    };

    document.addEventListener("click", handleClick, listenCapturing);

    return () => {
      document.removeEventListener("click", handleClick, listenCapturing);
    };
  }, [close, listenCapturing]);

  return ref;
}
