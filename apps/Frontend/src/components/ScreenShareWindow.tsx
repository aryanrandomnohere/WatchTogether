import { MdScreenShare } from "react-icons/md";
import { IoExpand } from "react-icons/io5";
import { useRecoilState, useRecoilValue } from "recoil";
import { screenShareState } from "../State/screenShareState";
import getSocket from "../services/getSocket";
import { useEffect, useRef, useState } from "react";
import { userInfo } from "../State/userState";
import { useParams } from "react-router-dom";
import getSsSocket from "../services/getSsSocket";
interface screenShareType {
    screenShare: boolean;
    screenSharerId: string | undefined;
}

let peer: RTCPeerConnection | null;
const socket = getSsSocket()

export default function ScreenShareWindow() {
    const [screenShare, setScreenShare] = useRecoilState(screenShareState);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
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

    // NEW: Handle renegotiation from server
    socket.on("ss-renegotiate", async ({ offer }: { offer: RTCSessionDescription }) => {
        console.log("Renegotiation offer received");
        if (peer) {
            try {
                await peer.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);
                socket.emit("ss-renegotiate-answer", answer, roomId);
                console.log("Renegotiation answer sent");
            } catch (error) {
                console.error("Error handling renegotiation:", error);
            }
        }
    });

    return () => {
        socket.off("server-ice-candidate");
        socket.off("ss-answer");
        socket.off("ss-renegotiate"); // Clean up new listener
    }
}, [])

    async function viewerInit() {
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
        console.log("Track event received:", e.streams[0]);
        if (videoRef.current) {
            videoRef.current.srcObject = e.streams[0];
            videoRef.current.muted = true; // Always start muted for autoplay
            videoRef.current.autoplay = true;
            videoRef.current.playsInline = true;

            videoRef.current.onloadedmetadata = () => {
                console.log("Video metadata loaded, attempting to play");
                if (videoRef.current) {
                    const playPromise = videoRef.current.play();
                    if (playPromise !== undefined) {
                        playPromise.then(() => {
                            console.log("Video playback started successfully");
                            // Unmute after playback starts if not the sharer
                            if (videoRef.current && screenShare.screenSharerId !== localStorage.getItem('userId')) {
                                setTimeout(() => {
                                    if (videoRef.current) {
                                        videoRef.current.muted = false;
                                    }
                                }, 1000);
                            }
                        }).catch(error => {
                            console.error("Error playing video:", error);
                        });
                    }
                }
            };

            videoRef.current.oncanplay = () => {
                console.log("Video can start playing");
                if (videoRef.current && videoRef.current.paused) {
                    videoRef.current.play().catch(e => console.error("Error in oncanplay:", e));
                }
            };

            videoRef.current.onerror = (e) => {
                console.error("Video element error:", e);
            };
            
            // Force load the video
            videoRef.current.load();

        } else {
            console.error("Video element reference is null");
        }
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

            if (videoRef.current) {
                const videoStream = new MediaStream(stream.getVideoTracks());
                videoRef.current.srcObject = videoStream;
                videoRef.current.muted = true; // Mute for self-view to prevent feedback
                videoRef.current.play();
            }

            const peer = createPeer();
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
        } catch (error) {
            console.error("Error starting screen share:", error);
        }
    }

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
                className="w-full h-full object-contain bg-black rounded-lg cursor-pointer"
                autoPlay
                playsInline
                muted={screenShare.screenSharerId === localStorage.getItem('userId')} // Mute self-view, unmute others
                controls={false}
                ref={videoRef}
                onClick={handleVideoClick}
                onError={(e) => console.error("Video error:", e)}
                style={{ backgroundColor: 'black' }}
            />
            {/* Add overlay message if video isn't playing */}
            {screenShare.screenShare && screenShare.screenSharerId !== localStorage.getItem('userId') && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/50 text-white px-4 py-2 rounded-lg text-sm">
                        Click to play if video doesn't start automatically
                    </div>
                </div>
            )}
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