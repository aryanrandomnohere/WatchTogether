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
interface screenShareType {
    status: boolean;
    screenSharerId: string | undefined;
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
        //@ts-ignore
        window.mediaStream = stream;
    
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
    
            getSocket().emit('screen-share', localStorage.getItem('userId') || Info.id, roomId);
    
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
             <video
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
          ></iframe> }

            {/* Add overlay message if video isn't playing */}
            {/* {screenShare.status && screenShare.screenSharerId !== localStorage.getItem('userId') && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/50 text-white px-4 py-2 rounded-lg text-sm">
                        Click to play if video doesn't start automatically
                    </div>
                </div>
            )} */}
            <div className="absolute top-1 right-4 flex gap-2">
               
                {!screenShare.status ? (
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