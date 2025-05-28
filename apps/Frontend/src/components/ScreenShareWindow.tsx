import { MdScreenShare } from "react-icons/md";
import { IoExpand } from "react-icons/io5";
import { useRecoilState, useRecoilValue } from "recoil";
import { screenShareState } from "../State/screenShareState";
import getSocket from "../services/getSocket";
import { useEffect, useRef, useState } from "react";
import { userInfo } from "../State/userState";
import { useParams } from "react-router-dom";
import getSsSocket from "../services/getSsSocket";
import toast from "react-hot-toast";

enum ssType {
    P2P,
    SERVER
  }
  interface screenShareType {
    status: boolean;
    screenSharerId: string | undefined;
    type:ssType | null
  }

let peer: RTCPeerConnection | null;
const socket = getSsSocket()
export default function ScreenShareWindow({getIframeHeight,iframeSource}:{iframeSource:string, getIframeHeight: ()=>string}) {
    const [screenShare, setScreenShare] = useRecoilState(screenShareState);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isViewing,setIsViewing] = useState(false)
    const Info = useRecoilValue(userInfo);
    const { roomId } = useParams();
    const [type, setType] = useState<ssType | null>(null)

    useEffect(() => {
    socket.on("ss-answer", ({ answer }: { answer: RTCSessionDescription }) => {
        if (peer) {
            console.log("answer-received", answer)
            const desc = new RTCSessionDescription(answer);
            peer.setRemoteDescription(desc).catch(e => console.log("Error 104:", e));
        }
    });

    socket.on("server-ice-candidate", ({ candidate }: { candidate: RTCIceCandidate }) => {
        console.log("Ice candidate received from the server")
        if (peer) {
            peer.addIceCandidate(new RTCIceCandidate(candidate))
                .catch(e => console.log("Error adding ICE candidate:", e));
        }
    });

    getSocket().on("screen-share",(updatedState:screenShareType)=>{
        setScreenShare(updatedState)
    })
    getSocket().on("stop-screen-share",(updatedState:screenShareType)=>{
        toast.success("Screen Share Ended")
        setScreenShare(updatedState)
        setIsViewing(false);
        if (videoRef.current?.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
          }
        
          // Clear the video element
          videoRef.current!.srcObject = null;
        
          // Close and nullify peer
          if (peer) {
            peer.ontrack = null;
            peer.onicecandidate = null;
            peer.onconnectionstatechange = null;
            peer.close();
            peer = null; // <== if you're using `let peer`
          }
    })

    // NEW: Handle renegotiation from server
    // socket.on("ss-renegotiate", async ({ offer }: { offer: RTCSessionDescription }) => {
    //     console.log("Renegotiation offer received");
    //     if (peer) {
    //         try {
    //             await peer.setRemoteDescription(new RTCSessionDescription(offer));
    //             const answer = await peer.createAnswer();
    //             await peer.setLocalDescription(answer);
    //             socket.emit("ss-renegotiate-answer", answer, roomId);
    //             console.log("Renegotiation answer sent");
    //         } catch (error) {
    //             console.error("Error handling renegotiation:", error);
    //         }
    //     }
    // });

    return () => {
        socket.off("server-ice-candidate");
        socket.off("ss-answer");
        getSocket().off("screen-share");
        getSocket().off("stop-screen-share")
        // socket.off("ss-renegotiate"); // Clean up new listener
    }
}, [])

    async function viewerInit() {
        setIsViewing(true);
        peer = createViewerPeer();
        peer.addTransceiver("video", { direction: "recvonly" })
    }

    function createViewerPeer() {
        const peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.stunprotocol.org"
                }
            ]
        });
        peer.onicecandidate = (event) => {
            if (event.candidate) {
                console.log("Sending ice candidate to the server")
                socket.emit("client-ice-candidate", "consumer", roomId, event.candidate)
            }
        }
        peer.ontrack = handleViewerTrackEvent;
        peer.onnegotiationneeded = () => handleViewerNegotiationNeededEvent();
        return peer;
    }

    async function handleViewerNegotiationNeededEvent() {
        if (!peer) return
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        const payload = {
            sdp: peer.localDescription
        };
        console.log("Sending the sdp as consumer")
        socket.emit("consumer", payload.sdp, roomId, Info.id)
    }

    function handleViewerTrackEvent(e: RTCTrackEvent) {
        const stream = e.streams?.[0];
    
        console.log("Track event received.");
        if (!stream) {
            console.error("❌ No stream found in RTCTrackEvent.");
            return;
        }
    
        console.log("✅ Stream object received:", stream);
        console.log("📺 Stream active:", stream.active);
        console.log("🎥 Video tracks:", stream.getVideoTracks());
        console.log("🎙️ Audio tracks:", stream.getAudioTracks());
    
        if (!stream.active || stream.getTracks().length === 0) {
            console.warn("⚠️ Received stream is inactive or has no tracks.");
        }
    
        // Optional: Expose stream globally for manual testing
    
        if (!videoRef.current) {
            console.error("❌ videoRef is null.");
            return;
        }
    
        const videoEl = videoRef.current;
    
        console.log("🎯 Attaching stream to video element...");
        videoEl.srcObject = stream;
    
        videoEl.autoplay = true;
        videoEl.playsInline = true;
    
        // Start muted initially for autoplay to work across browsers
        const isSelfStream = screenShare.screenSharerId === localStorage.getItem('userId');
        videoEl.muted = true;
    
        videoEl.onloadedmetadata = () => {
            console.log("✅ Video metadata loaded");
    
            videoEl.play().then(() => {
                console.log("▶️ Video playback started");
    
                if (!isSelfStream) {
                    // Unmute after a short delay to allow autoplay
                    setTimeout(() => {
                        if (videoEl) {
                            videoEl.muted = false;
                            console.log("🔊 Video unmuted for remote stream");
                        }
                    }, 1000);
                }
            }).catch((error) => {
                console.error("❌ Error playing video:", error);
            });
        };
    
        videoEl.oncanplay = () => {
            console.log("⏯️ Video can start playing");
            if (videoEl.paused) {
                videoEl.play().catch(e => console.error("❌ Error in oncanplay play():", e));
            }
        };
    
        videoEl.onerror = (e) => {
            console.error("❌ Video element error:", e);
        };
    }
    
    async function screenShareInit() {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { ideal: 60, max: 60 }
                },
                audio: true
            });
    
            // Start track health monitoring
            checkSharerVideoTrack(stream);
    
            if(!videoRef.current){
                console.log("Ref not found")
            }

            if (videoRef.current) {
                const videoStream = new MediaStream(stream.getVideoTracks());
                videoRef.current.srcObject = videoStream;
                videoRef.current.muted = true; // Mute for self-view to prevent feedback
                await videoRef.current.play();
            }
    
            const peer = createPeer();
            stream.getTracks().forEach(track => peer.addTrack(track, stream));
    
            setScreenShare({
                status: true,
                screenSharerId: localStorage.getItem('userId') || undefined
            });
    
            getSocket().emit('screen-share', localStorage.getItem('userId') || Info.id, roomId, );
    
            stream.getVideoTracks()[0].onended = () => {
                if (videoRef.current) {
                    videoRef.current.srcObject = null;
                }
    
                setScreenShare({
                    status: false,
                    screenSharerId: undefined
                });
    
                getSocket().emit('stop-screen-share', roomId);
            };
        } catch (error) {
            console.error("Error starting screen share:", error);
        }
    }
    
    // Health check function for sharer's video track
    const checkSharerVideoTrack = (stream: MediaStream) => {
        const track = stream.getVideoTracks()[0];
        setInterval(() => {
          console.log("📡 Sharer Track State:");
          console.log("▶️ enabled:", track.enabled);
          console.log("🔇 muted:", track.muted);
          console.log("📽️ readyState:", track.readyState);
      
          if (track.readyState !== "live" || track.muted) {
            console.warn("⚠️ Sharer's track is not delivering frames.");
          } else {
            console.log("✅ Sharer's track is healthy.");
          }
        }, 2000);
      };
      
    
    function createPeer() {
        peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.stunprotocol.org"
                }
            ]
        });
        peer.onicecandidate = (event) => {
            if (event.candidate) {
                console.log("Sending Ice Candidate to the server")
                socket.emit("client-ice-candidate", "broadcaster", roomId, event.candidate)
            }
        }
        peer.onnegotiationneeded = () => handleNegotiationNeededEvent();
        return peer;
    }

    async function handleNegotiationNeededEvent() {
        if (!peer) {
            console.log("Peer does not exist")
            return
        }
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        const payload = {
            sdp: peer.localDescription
        };
        console.log("Sending Final Sdp", payload.sdp)
        socket.emit("broadcast", payload.sdp, roomId, Info.id)
    }

    useEffect(() => {
        getSocket().on('screen-share', (screenShare: screenShareType) => {
            setScreenShare(screenShare);
        });
        return () => {
            getSocket().off('screen-share');
        };
    });

    const toggleFullscreen = () => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen().then(() => {
                setIsFullscreen(false);
            }).catch(err => {
                console.error(`Error attempting to exit fullscreen: ${err.message}`);
            });
        }
    };

    function handleEndScreenShare(){
        getSocket().emit("stop-screen-share",roomId, localStorage.getItem('userId') || Info.id)
        setScreenShare({screenSharerId:undefined,status:false})
        toast.success("Screen Share ended")
        if (videoRef.current?.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
          }
        
          // Clear the video element
          videoRef.current!.srcObject = null;
        
          // Close and nullify peer
          if (peer) {
            peer.ontrack = null;
            peer.onicecandidate = null;
            peer.onconnectionstatechange = null;
            peer.close();
            peer = null; // <== if you're using `let peer`
          }
    }

    function handleLeaveScreenShare(){
         setIsViewing(false);
         if (videoRef.current?.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
          }
        
          // Clear the video element
          videoRef.current!.srcObject = null;
        
          // Close and nullify peer
          if (peer) {
            peer.ontrack = null;
            peer.onicecandidate = null;
            peer.onconnectionstatechange = null;
            peer.close();
            peer = null; // <== if you're using `let peer`
          }
        toast.success("Leaved room successfully")
    }

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Add click handler to try playing video if it's not playing
    const handleVideoClick = () => {
        if (videoRef.current && videoRef.current.paused) {
            videoRef.current.play().catch(e => console.error("Manual play error:", e));
        }
    };

    return (
        <div ref={containerRef} className="screen-share-container w-full h-full flex flex-col items-center justify-center relative">
   <div className="relative flex justify-center items-center w-full h-full"><video
                className={`w-full h-full object-contain bg-black rounded-lg cursor-pointer ${screenShare.status? "block":"hidden"}`}
                autoPlay
                playsInline
                muted={screenShare.screenSharerId === localStorage.getItem('userId')} // Mute self-view, unmute others
                controls={false}
                ref={videoRef}
                onClick={handleVideoClick}
                onError={(e) => console.error("Video error:", e)}
                style={{ backgroundColor: 'black' }}
            /> 
       {!screenShare.status && <iframe
            className={`w-full ${getIframeHeight()} max-w-[73rem] rounded ${!screenShare.status? "block":"hidden"}`}
            src={`${iframeSource}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
           }
             <div className="absolute flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 w-full h-full">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl"></div>
        
        <div className="flex w-full h-full justify-center items-center flex-col gap-8 relative z-10">
            <div className="text-center fade-in mb-4">
                <h1 className="text-3xl font-bold text-white mb-2">Choose Connection Method</h1>
                <p className="text-gray-300">Select how you want to share your screen</p>
            </div>
            
            <div className="flex gap-8 fade-in">
                <div className="flex flex-col items-center group">
                    <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 border-none rounded-xl text-white font-semibold text-lg shadow-lg hover:shadow-purple-500/25 transition-all duration-300 button-hover transform hover:scale-105 min-w-[160px]" 
                            onClick={()=>setType(ssType.P2P)}>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path>
                            </svg>
                            Direct P2P
                        </div>
                    </button>
                    <div className="mt-3 text-center max-w-[200px] opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-sm text-purple-200 font-medium mb-1">Peer-to-Peer</p>
                        <p className="text-xs text-gray-300">Lower latency, direct connection for faster streaming</p>
                    </div>
                </div>
                
                <div className="flex flex-col items-center group">
                    <button className= "px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border-none rounded-xl text-white font-semibold text-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300 button-hover transform hover:scale-105 min-w-[160px]" 
                            onClick={()=>setType(ssType.SERVER)}>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path>
                            </svg>
                            Via Server
                        </div>
                    </button>
                    <div className="mt-3 text-center max-w-[200px] opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-sm text-blue-200 font-medium mb-1">Server Relay</p>
                        <p className="text-xs text-gray-300">More reliable, works behind firewalls and NAT</p>
                    </div>
                </div>
            </div>
            
            <div className="text-center text-gray-400 text-sm fade-in mt-4 max-w-md">
                <p>Both methods provide secure screen sharing. Choose based on your network setup and performance needs.</p>
            </div>
        </div>
    </div>
           </div>



            {/* Add overlay message if video isn't playing */}
            {/* {screenShare.status && screenShare.screenSharerId !== localStorage.getItem('userId') && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/50 text-white px-4 py-2 rounded-lg text-sm">
                        Click to play if video doesn't start automatically
                    </div>
                </div>
            )} */}
            <div className="absolute top-1 right-4 flex gap-2">
                
                {!screenShare.status && screenShare.type ? (
                    <div onClick={screenShareInit} className="my-button bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-white p-1.5 hover:cursor-pointer flex text-sm justify-center items-center gap-2 hover:bg-slate-400 dark:hover:bg-slate-800">
                        <MdScreenShare className="sm:text-xl" />
                        Screen Share
                    </div>
                ) : screenShare.screenSharerId === localStorage.getItem('userId') ? (
                    <div onClick={handleEndScreenShare} className="my-button bg-slate-300 dark:bg-red-600 text-slate-800 dark:text-white p-1.5 hover:cursor-pointer flex text-sm justify-center items-center gap-2 hover:bg-slate-400 dark:hover:bg-slate-800">
                        <MdScreenShare className="sm:text-xl" />
                        Stop Screen Share
                    </div>
                ) : isViewing ? ( <div onClick={handleLeaveScreenShare} className="my-button bg-slate-300 dark:bg-red-600 text-slate-800 dark:text-white p-1.5 hover:cursor-pointer flex text-sm justify-center items-center gap-2 hover:bg-slate-400 dark:hover:bg-slate-800">
                    <MdScreenShare className="sm:text-xl" />
                    Leave
                </div>) :(
                    <div onClick={viewerInit} className="my-button bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-white p-1.5 hover:cursor-pointer flex text-sm justify-center items-center gap-2 hover:bg-slate-400 dark:hover:bg-slate-800">
                        <MdScreenShare className="sm:text-xl" />
                        Enter Stream
                    </div>
                )}
                 {screenShare.status && (
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-lg transition-colors"
                        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                        <IoExpand className="text-xl" />
                    </button>
                )}
            </div>
        </div>
    )
}