import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import * as mediasoupClient from 'mediasoup-client';
import { Socket, io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:4440'; 

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
        secure: false
      });

      // Add connection error handler
      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setError('Failed to connect to server. Please try again.');
      });

      // Add error handler
      socketRef.current.on('error', (error) => {
        console.error('Socket error:', error);
        setError('An error occurred. Please try again.');
      });

      // Wait for socket connection
      await new Promise<void>((resolve, reject) => {
        if (socketRef.current?.connected) {
          resolve();
        } else {
          socketRef.current?.on('connect', () => resolve());
          socketRef.current?.on('connect_error', (error) => reject(error));
        }
      });

      console.log('Socket connected, joining room...');

      // Join the room first
      await socketRef.current.emitWithAck('join', { 
        roomId, 
        peerId: socketRef.current.id 
      });

      console.log('Room joined, initializing MediaSoup device...');

      // Initialize MediaSoup device
      deviceRef.current = new mediasoupClient.Device();

      // Get router RTP capabilities
      const { rtpCapabilities } = await socketRef.current.emitWithAck('getRouterRtpCapabilities');
      console.log('Got router capabilities, loading device...');
      
      await deviceRef.current.load({ routerRtpCapabilities: rtpCapabilities });
      console.log('Device loaded, creating transport...');

      // Create WebRTC transport for sending
      const { transportOptions } = await socketRef.current.emitWithAck('createWebRtcTransport', {
        forceTcp: false,
        producing: true,
        consuming: false,
      });

      console.log('Transport created, setting up handlers...');

      sendTransportRef.current = deviceRef.current.createSendTransport(transportOptions);

      // Set up transport event handlers
      sendTransportRef.current.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          console.log('Transport connecting...');
          await socketRef.current!.emitWithAck('connectTransport', {
            transportId: sendTransportRef.current!.id,
            dtlsParameters,
          });
          console.log('Transport connected');
          callback();
        } catch (err) {
          console.error('Transport connection error:', err);
          errback(err as Error);
        }
      });

      sendTransportRef.current.on('produce', async ({ kind, rtpParameters }, callback, errback) => {
        try {
          console.log('Producing media...');
          const { id } = await socketRef.current!.emitWithAck('produce', {
            transportId: sendTransportRef.current!.id,
            kind,
            rtpParameters,
          });
          console.log('Media produced with ID:', id);
          callback({ id });
        } catch (err) {
          console.error('Produce error:', err);
          errback(err as Error);
        }
      });

      // Create WebRTC transport for receiving
      const { transportOptions: recvTransportOptions } = await socketRef.current.emitWithAck(
        'createWebRtcTransport',
        {
          forceTcp: false,
          producing: false,
          consuming: true,
        }
      );

      recvTransportRef.current = deviceRef.current.createRecvTransport(recvTransportOptions);

      // Set up receive transport event handlers
      recvTransportRef.current.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          await socketRef.current!.emitWithAck('connectTransport', {
            transportId: recvTransportRef.current!.id,
            dtlsParameters,
          });
          callback();
        } catch (err) {
          errback(err as Error);
        }
      });

      setIsConnected(true);
      console.log('Connected and ready for screen sharing');

      if (asPublisher) {
        await startScreenShare();
      } else {
        await startViewing();
      }
    } catch (error) {
      console.error('Error in joinRoom:', error);
      setError('Failed to join room. Please try again.');
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    }
  };

  const startScreenShare = async () => {
    try {
      console.log('Starting screen share...');
      
      // First check if we have a valid transport
      if (!sendTransportRef.current) {
        throw new Error('No transport available for screen sharing');
      }

      // Request screen sharing
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: 30,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      }).catch(error => {
        console.error('Error getting display media:', error);
        throw new Error('Failed to get screen sharing permission');
      });

      console.log('Got display media stream');

      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) {
        throw new Error('No video track available in the stream');
      }

      console.log('Creating producer with video track');

      // Create producer with the video track
      producerRef.current = await sendTransportRef.current.produce({
        track: videoTrack,
        encodings: [
          {
            rid: 'r0',
            maxBitrate: 100000,
            scalabilityMode: 'S1T3',
          },
        ],
        codecOptions: {
          videoGoogleStartBitrate: 1000,
        },
      }).catch(error => {
        console.error('Error creating producer:', error);
        throw new Error('Failed to start screen sharing');
      });

      console.log('Producer created successfully');

      // Handle when the user stops sharing
      videoTrack.onended = () => {
        console.log('Screen sharing ended');
        if (producerRef.current) {
          producerRef.current.close();
        }
        setIsConnected(false);
      };

      // Handle track errors
      videoTrack.onerror = (error) => {
        console.error('Video track error:', error);
        setError('Screen sharing error occurred');
      };

    } catch (error) {
      console.error('Error in startScreenShare:', error);
      setError(error instanceof Error ? error.message : 'Failed to start screen sharing');
      setIsConnected(false);
    }
  };

  const startViewing = async () => {
    try {
      const { producers } = await socketRef.current!.emitWithAck('getProducers');

      for (const producer of producers) {
        const consumer = await recvTransportRef.current!.consume({
          producerId: producer.id,
          paused: false,
        });

        const { track } = consumer;
        if (videoRef.current) {
          videoRef.current.srcObject = new MediaStream([track]);
          await videoRef.current.play();
        }

        await socketRef.current!.emitWithAck('resumeConsumer', {
          consumerId: consumer.id,
        });
      }
    } catch (error) {
      console.error('Error starting viewing:', error);
      setError('Failed to start viewing. Please try again.');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      {error && (
        <div style={{ 
          color: 'red', 
          marginBottom: 10,
          padding: '10px',
          backgroundColor: '#ffebee',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

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
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
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
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Join as Viewer
          </button>
        </div>
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ marginBottom: '20px' }}>
            {isPublisher ? 'Screen Sharing Active' : 'Viewing Screen Share'}
          </h2>
          <div style={{ flex: 1, position: 'relative', border: '1px solid #ccc', borderRadius: '4px' }}>
            {!isPublisher && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain',
                  backgroundColor: '#f5f5f5'
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
