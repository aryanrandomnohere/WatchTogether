import { useState } from 'react';
import { 
  LiveKitRoom, 
  VideoTrack, 
  useTracks, 
  TrackRefContext,
  useLocalParticipant
} from '@livekit/components-react';
import { Room, Track, RemoteTrack } from 'livekit-client';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// Add type declaration for import.meta.env
declare global {
  interface ImportMeta {
    env: {
      VITE_BACKEND_APP_API_BASE_URL: string;
    };
  }
}

const SERVER_URL = 'ws://localhost:7881'; // LiveKit SFU WebSocket URL

export default function Sfu() {
  const [token, setToken] = useState<string | null>(null);
  const [isPublisher, setIsPublisher] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { roomId } = useParams();

  const joinRoom = async (asPublisher: boolean) => {
    setIsPublisher(asPublisher);
    setError(null);

    const identity = `${asPublisher ? 'pub' : 'sub'}-${Math.random().toString(36).substring(7)}`;
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_APP_API_BASE_URL}/api/v1/room/get-token?identity=${identity}&room=${roomId}`, {
        headers: {
          authorization: localStorage.getItem('token') || '',
        },
      });
      
      const { token } = response.data;
      setToken(token);
    } catch (error) {
      console.error("Error getting token:", error);
      setError("Failed to get token. Please try again.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      
      {!token ? (
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            onClick={() => joinRoom(true)}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#4CAF50', 
              color: 'white', 
              border: 'none', 
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Start Screen Share
          </button>
          <button 
            onClick={() => joinRoom(false)}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#2196F3', 
              color: 'white', 
              border: 'none', 
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Join as Viewer
          </button>
        </div>
      ) : (
        <LiveKitRoom
          serverUrl={SERVER_URL}
          token={token}
          onConnected={async (room: Room) => {
            if (isPublisher) {
              try {
                // Request screen sharing with audio
                const mediaStream = await navigator.mediaDevices.getDisplayMedia({ 
                  video: { 
                    frameRate: 30,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                  }, 
                  audio: true 
                });
                
                // Get the video and audio tracks
                const videoTrack = mediaStream.getVideoTracks()[0];
                const audioTrack = mediaStream.getAudioTracks()[0];
                
                // Publish the tracks to the room
                if (videoTrack) {
                  await room.localParticipant.publishTrack(videoTrack);
                }
                
                if (audioTrack) {
                  await room.localParticipant.publishTrack(audioTrack);
                }
                
                // Handle when the user stops sharing
                videoTrack.onended = () => {
                  room.localParticipant.unpublishTrack(videoTrack);
                  if (audioTrack) {
                    room.localParticipant.unpublishTrack(audioTrack);
                  }
                };
              } catch (error) {
                console.error('Error publishing media:', error);
                setError('Failed to start screen sharing. Please check your browser permissions.');
              }
            }
          }}
          onDisconnected={() => {
            console.log('Disconnected from room');
            setToken(null);
          }}
          data-lk-theme="default"
        >
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h2>{isPublisher ? 'Screen Sharing' : 'Viewing Screen Share'}</h2>
            <div style={{ flex: 1, position: 'relative' }}>
              <ScreenShareView />
            </div>
          </div>
        </LiveKitRoom>
      )}
    </div>
  );
}

// Component to handle screen share display
function ScreenShareView() {
  const { localParticipant } = useLocalParticipant();
  const tracks = useTracks([Track.Source.ScreenShare], { onlySubscribed: true });
  
  // If we're the publisher, show our local screen share
  if (localParticipant && localParticipant.isScreenShareEnabled) {
    // Find the screen share track from the local participant
    const screenTracks = localParticipant.getTrackPublications()
      .filter(pub => pub.source === Track.Source.ScreenShare && pub.isSubscribed);
    
    if (screenTracks.length > 0) {
      const screenTrack = screenTracks[0].track;
      if (screenTrack) {
        return (
          <TrackRefContext.Provider value={screenTrack}>
            <VideoTrack />
          </TrackRefContext.Provider>
        );
      }
    }
  }
  
  // Otherwise, show the first remote screen share track
  if (tracks.length > 0) {
    const remoteTrack = tracks[0] as RemoteTrack;
    return (
      <TrackRefContext.Provider value={remoteTrack}>
        <VideoTrack />
      </TrackRefContext.Provider>
    );
  }
  
  // No screen share available
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100%',
      backgroundColor: '#f5f5f5',
      borderRadius: 8,
      padding: 20
    }}>
      <p>No screen share available</p>
    </div>
  );
}
