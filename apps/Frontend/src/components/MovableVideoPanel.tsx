import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Camera, CameraOff, Mic, MicOff } from "lucide-react";

export default function MovableVideoPanel({
  localVideoRef,
  videoRef1,
  videoRef2,
  videoRef3,
  cameraStatus,
  micStatus,
  handleVideoToggle,
  handleMicToggle,
}: {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  videoRef1: React.RefObject<HTMLVideoElement>;
  videoRef2: React.RefObject<HTMLVideoElement>;
  videoRef3: React.RefObject<HTMLVideoElement>;
  cameraStatus: boolean;
  micStatus: boolean;
  handleVideoToggle: () => void;
  handleMicToggle: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 550, y: window.innerHeight - 270 });
  const [size, setSize] = useState({ width: 550, height: 250 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const people = [localVideoRef, videoRef1, videoRef2, videoRef3].reduce((acc, ref) => {
    if (ref.current && ref.current.srcObject) {
      return acc + 1;
    }
    return acc;
  }, 0);
  
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (target.classList.contains("resize-handle")) {
        setIsResizing(true);
        setResizeStart({
          x: e.clientX,
          y: e.clientY,
          width: size.width,
          height: size.height,
        });
        return;
      }

      if (target.closest(".control-button") || target.closest("video")) {
        return;
      }

      setIsDragging(true);
      const rect = panelRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        const newWidth = Math.max(200*people, Math.min(425*people, resizeStart.width + deltaX));
        const newHeight = Math.max(200, Math.min(350, resizeStart.height + deltaY));
//176
        setSize({ width: newWidth, height: newHeight });
      } else if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        const maxX = window.innerWidth - size.width;
        const maxY = window.innerHeight - size.height;

        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      }
    };

    const panel = panelRef.current;

    if (panel) panel.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      if (panel) panel.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart, size]);

  const handleControlClick = (e: React.MouseEvent) => e.stopPropagation();

  const getCursor = () => (isResizing ? "nw-resize" : isDragging ? "grabbing" : "grab");

  return createPortal(
    
    <div
      ref={panelRef}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        cursor: getCursor(),
        userSelect: "none",
      }}
      className={`fixed z-50 bg-gray-900  bg-opacity-90 backdrop-blur-sm rounded-lg border border-gray-600 shadow-lg flex ${localVideoRef.current?.srcObject ?" block" : "hidden"}`}
    >
        
      {/* Drag indicator */}
      <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-400 rounded-full opacity-50 pointer-events-none"></div>

      {/* Video Grid */}
      <div className="flex-1 p-2 pr-0">
        <div className="flex f gap-1 h-full">
          {[localVideoRef, videoRef1, videoRef2, videoRef3].map((ref, index) => (
            <div className="relative" key={index}>
              <video
                ref={ref}
                autoPlay
                playsInline
                muted={ref === localVideoRef}
                className={`w-full h-full object-cover rounded min-w-40  max-w-96 bg-gray-800 ${
                  ref.current?.srcObject ? "block" : "hidden"
                }`}
              />
              {!ref.current?.srcObject && (
                // <div className="w-full h-full bg-gray-800 rounded flex items-center justify-center">
                //   <span className="text-gray-400 text-xs">
                //     {ref === localVideoRef ? "Local" : `User ${index}`}
                //   </span>
                // </div>
                <></>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Control Panel */}
      <div className="w-12 flex flex-col justify-center items-center gap-3 border-l border-gray-600 bg-gray-800 bg-opacity-50">
        <button
          onClick={(e) => {
            handleControlClick(e);
            handleMicToggle();
          }}
          className={`control-button p-2 rounded-full transition-all duration-200 hover:bg-gray-700 hover:scale-110 ${
            micStatus ? "text-white bg-gray-700" : "text-red-500 bg-red-900 bg-opacity-30"
          }`}
          aria-label={micStatus ? "Mute microphone" : "Unmute microphone"}
        >
          {micStatus ? <Mic size={16} /> : <MicOff size={16} />}
        </button>
        <button
          onClick={(e) => {
            handleControlClick(e);
            handleVideoToggle();
          }}
          className={`control-button p-2 rounded-full transition-all duration-200 hover:bg-gray-700 hover:scale-110 ${
            cameraStatus ? "text-white bg-gray-700" : "text-red-500 bg-red-900 bg-opacity-30"
          }`}
          aria-label={cameraStatus ? "Turn off camera" : "Turn on camera"}
        >
          {cameraStatus ? <Camera size={16} /> : <CameraOff size={16} />}
        </button>
      </div>

      {/* Resize Handle */}
      <div
        className="resize-handle absolute bottom-0 right-0 w-3 h-3 cursor-nw-resize opacity-30 hover:opacity-70 transition-opacity"
        style={{
          background:
            "linear-gradient(-45deg, transparent 30%, #9CA3AF 30%, #9CA3AF 70%, transparent 70%)",
          borderBottomRightRadius: "0.5rem",
        }}
      />
    </div>,
    document.body
  );
}
