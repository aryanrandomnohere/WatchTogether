// import  { useState, useRef } from 'react';

// const CustomVideoPlayer = () => {
//   const iframeRef = useRef(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [volume, setVolume] = useState(100);

//   const togglePlayPause = () => {
//     setIsPlaying(!isPlaying);
//   };

//   const toggleFullscreen = () => {
//     if (isFullscreen) {
//       document.exitFullscreen();
//     } else {
//       iframeRef.current.requestFullscreen();
//     }
//     setIsFullscreen(!isFullscreen);
//   };

//   const handleVolumeChange = (event) => {
//     setVolume(event.target.value);
//     // Adjust iframe volume if supported by iframe provider API
//   };

//   return (
//     <div className="relative w-full max-w-3xl mx-auto bg-slate-950  overflow-hidden rounded-lg shadow-lg">
//       {/* Iframe Wrapper */}
//       <div className="relative w-full pb-[56.25%]"> {/* Aspect ratio 16:9 */}
//         <iframe
//           ref={iframeRef}
//           src="https://www.2embed.cc/embedtvfull/tt0988824"
//           className="absolute top-0 left-0 w-full h-full"
//           frameBorder="0"
//           scrolling="no"
//           allowFullScreen
//           title="Embedded Video"
//         ></iframe>
//       </div>

//       {/* Custom Controls */}
//       <div className="flex justify-center items-center bg-slate-950  bg-opacity-70 text-white p-4 space-x-4">
//         <button
//           onClick={togglePlayPause}
//           className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
//         >
//           {isPlaying ? 'Pause' : 'Play'}
//         </button>
        
//         <input
//           type="range"
//           min="0"
//           max="100"
//           value={volume}
//           onChange={handleVolumeChange}
//           className="w-24 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
//         />
        
//         <button
//           onClick={toggleFullscreen}
//           className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
//         >
//           {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default CustomVideoPlayer;
