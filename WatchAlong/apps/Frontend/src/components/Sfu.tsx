import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import * as mediasoupClient from 'mediasoup-client';

const SERVER_URL = 'https://localhost:4443';

export default function Sfu() {
  const [isPublisher, setIsPublisher] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { roomId } = useParams();
  
  const socketRef = useRef<Socket | null>(null);
  const deviceRef = useRef<mediasoupClient.types.Device | null>(null);
  const sendTransportRef = useRef<mediasoupClient.types.Transport | null>(null);
  const recvTransportRef = useRef<mediasoupClient.types.Transport | null>(null);
  const producerRef = useRef<mediasoupClient.types.Producer | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const joinRoom = async (asPublisher: boolean) => {
    setIsPublisher(asPublisher);
    setError(null);

    try {
      // Initialize socket connection
      socketRef.current = io(SERVER_URL, {
        transports: ['websocket', 'polling'],
        rejectUnauthorized: false,
        secure: true
      });

      // Initialize MediaSoup device
      deviceRef.current = new mediasoupClient.Device();

      // Get router RTP capabilities
      const { rtpCapabilities } = await socketRef.current.emitWithAck('getRouterRtpCapabilities');
      await deviceRef.current.load({ routerRtpCapabilities: rtpCapabilities });

      // Create WebRTC transport for sending
      const { transportOptions } = await socketRef.current.emitWithAck('createWebRtcTransport', {
        forceTcp: false,
        producing: true,
        consuming: false
      });

      sendTransportRef.current = deviceRef.current.createSendTransport(transportOptions);

      // Set up transport event handlers
      sendTransportRef.current.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          await socketRef.current!.emitWithAck('connectTransport', {
            transportId: sendTransportRef.current!.id,
            dtlsParameters
          });
          callback();
        } catch (err) {
          errback(err as Error);
        }
      });

      sendTransportRef.current.on('produce', async ({ kind, rtpParameters }, callback, errback) => {
        try {
          const { id } = await socketRef.current!.emitWithAck('produce', {
            transportId: sendTransportRef.current!.id,
            kind,
            rtpParameters
          });
          callback({ id });
        } catch (err) {
          errback(err as Error);
        }
      });

      // Create WebRTC transport for receiving
      const { transportOptions: recvTransportOptions } = await socketRef.current.emitWithAck('createWebRtcTransport', {
        forceTcp: false,
        producing: false,
        consuming: true
      });

      recvTransportRef.current = deviceRef.current.createRecvTransport(recvTransportOptions);

      // Set up receive transport event handlers
      recvTransportRef.current.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          await socketRef.current!.emitWithAck('connectTransport', {
            transportId: recvTransportRef.current!.id,
            dtlsParameters
          });
          callback();
        } catch (err) {
          errback(err as Error);
        }
      });

      setIsConnected(true);

      if (asPublisher) {
        await startScreenShare();
      } else {
        await startViewing();
      }
    } catch (error) {
      console.error('Error joining room:', error);
      setError('Failed to join room. Please try again.');
    }
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: 30,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });

      const videoTrack = stream.getVideoTracks()[0];

      if (videoTrack) {
        producerRef.current = await sendTransportRef.current!.produce({
          track: videoTrack,
          encodings: [
            {
              rid: 'r0',
              maxBitrate: 100000,
              scalabilityMode: 'S1T3'
            }
          ],
          codecOptions: {
            videoGoogleStartBitrate: 1000
          }
        });
      }

      // Handle when the user stops sharing
      videoTrack.onended = () => {
        if (producerRef.current) {
          producerRef.current.close();
        }
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Error starting screen share:', error);
      setError('Failed to start screen sharing. Please check your browser permissions.');
    }
  };

  const startViewing = async () => {
    try {
      const { producers } = await socketRef.current!.emitWithAck('getProducers');

      for (const producer of producers) {
        const consumer = await recvTransportRef.current!.consume({
          producerId: producer.id,
          paused: false
        });

        const { track } = consumer;
        if (videoRef.current) {
          videoRef.current.srcObject = new MediaStream([track]);
          await videoRef.current.play();
        }

        await socketRef.current!.emitWithAck('resumeConsumer', {
          consumerId: consumer.id
        });
      }
    } catch (error) {
      console.error('Error starting viewing:', error);
      setError('Failed to start viewing. Please try again.');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      
      {!isConnected ? (
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
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <h2>{isPublisher ? 'Screen Sharing' : 'Viewing Screen Share'}</h2>
          <div style={{ flex: 1, position: 'relative' }}>
            {!isPublisher && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
