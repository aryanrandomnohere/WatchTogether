import { MdScreenShare } from "react-icons/md";
import { IoExpand } from "react-icons/io5";
import { useRecoilState, useRecoilValue } from "recoil";
import { screenShareState } from "../State/screenShareState";
import getSocket from "../services/getSocket";
import { useEffect, useRef, useState } from "react";
import { userInfo } from "../State/userState";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

interface screenShareType {
    screenShare: boolean;
    screenSharerId: string | undefined;
}

let peer: RTCPeerConnection | null;
let isViewer = false; // Track if this is a viewer or broadcaster

const socket = io(`${import.meta.env.VITE_BACKEND_SCREENSHARE_URL}?userId=${localStorage.getItem("userId")}`)

export default function ScreenShareWindow() {
    const [screenShare, setScreenShare] = useRecoilState(screenShareState);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const Info = useRecoilValue(userInfo);
    const { roomId } = useParams();

    useEffect(() => {
        // Handle server answer
        socket.on("ss-answer", ({ answer }: { answer: RTCSessionDescription }) => {
              console.log("answer-received", answer)
            if (peer) {
                console.log("answer-received", answer)
                const desc = new RTCSessionDescription(answer);
                peer.setRemoteDescription(desc).catch(e => console.log("Error 104:", e));
            }
        });

        // Handle server ICE candidates
        socket.on("server-ice-candidate", ({ candidate }: { candidate: RTCIceCandidate }) => {
            console.log("server-ice-candidate received ice candidate", candidate)
            if (peer) {
                peer.addIceCandidate(new RTCIceCandidate(candidate))
                    .catch(e => console.log("Error adding ICE candidate:", e));
            }
        });

        return () => {
            socket.off("ss-answer");
            socket.off("server-ice-candidate");
        };
    }, []);

    async function viewerInit() {
        isViewer = true;
        peer = createViewerPeer();
        peer.addTransceiver("video", { direction: "recvonly" });
    }

    function createViewerPeer() {
        const peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.l.google.com:19302"
                }
            ]
        });
        
        peer.onicecandidate = (event) => {
            if (event.candidate) {
                // Fixed: Use correct event name and type for consumer
                socket.emit("client-ice-candidate", "consumer",roomId, event.candidate);
            }
        };
        
        peer.ontrack = handleViewerTrackEvent;
        peer.onnegotiationneeded = () => handleViewerNegotiationNeededEvent();

        return peer;
    }

    async function handleViewerNegotiationNeededEvent() {
        if (!peer) return;
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        
        // Fixed: Use /consumer endpoint for viewers
        socket.emit("/consumer", peer.localDescription, roomId, Info.id);
    }

    function handleViewerTrackEvent(e: RTCTrackEvent) {
        if (videoRef.current) {
            videoRef.current.srcObject = e.streams[0];
            videoRef.current.play();
        }
    }

    async function screenShareInit() {
        isViewer = false;
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                frameRate: { ideal: 60, max: 60 }
            },
            audio: true
        });
        
        if (videoRef.current) {
            const videoStream = new MediaStream(stream.getVideoTracks());
            videoRef.current.srcObject = videoStream;
            console.log(videoRef.current.srcObject);
            videoRef.current.play();
        }

        const peer = createBroadcasterPeer();
        stream.getTracks().forEach(track => peer.addTrack(track, stream));
        
        setScreenShare({
            screenShare: true,
            screenSharerId: localStorage.getItem('userId') || undefined
        });
        
        getSocket().emit('screen-share', localStorage.getItem('userId') || Info.id, roomId);

        stream.getVideoTracks()[0].onended = () => {
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            setScreenShare({
                screenShare: false,
                screenSharerId: undefined
            });
            getSocket().emit('stop-screen-share', roomId);
        };
    }

    function createBroadcasterPeer() {
        peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.l.google.com:19302"
                }
            ]
        });
        
        peer.onicecandidate = (event) => {
            if (event.candidate) {
                // Fixed: Use correct event name and type for broadcaster
                socket.emit("client-ice-candidate", "broadcaster",roomId, event.candidate);
            }
        };
        
        peer.onnegotiationneeded = () => handleBroadcasterNegotiationNeededEvent();
        return peer;
    }

    async function handleBroadcasterNegotiationNeededEvent() {
        if (!peer) return;
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        
        // Use /broadcast endpoint for broadcasters
        console.log("Sending offer to the server:",peer.localDescription)
        socket.emit("/broadcast", peer.localDescription, roomId, Info.id);
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

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    return (
        <div ref={containerRef} className="screen-share-container w-full h-full flex flex-col items-center justify-center relative">
            <video
                className="w-full h-full object-contain bg-black rounded-lg"
                autoPlay
                playsInline
                ref={videoRef}
            />
            <div className="absolute bottom-4 right-4 flex gap-2">
                {screenShare.screenShare && (
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-lg transition-colors"
                        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                        <IoExpand className="text-xl" />
                    </button>
                )}
                {!screenShare.screenShare ? (
                    <div onClick={screenShareInit} className="my-button bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-white p-1.5 hover:cursor-pointer flex text-sm justify-center items-center gap-2 hover:bg-slate-400 dark:hover:bg-slate-800">
                        <MdScreenShare className="sm:text-xl" />
                        Screen Share
                    </div>
                ) : screenShare.screenSharerId === localStorage.getItem('userId') ? (
                    <div className="my-button bg-slate-300 dark:bg-red-600 text-slate-800 dark:text-white p-1.5 hover:cursor-pointer flex text-sm justify-center items-center gap-2 hover:bg-slate-400 dark:hover:bg-slate-800">
                        <MdScreenShare className="sm:text-xl" />
                        Stop Screen Share
                    </div>
                ) : (
                    <div onClick={viewerInit} className="my-button bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-white p-1.5 hover:cursor-pointer flex text-sm justify-center items-center gap-2 hover:bg-slate-400 dark:hover:bg-slate-800">
                        <MdScreenShare className="sm:text-xl" />
                        Enter Stream
                    </div>
                )}
            </div>
        </div>
    )
}