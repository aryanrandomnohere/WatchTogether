// socket.js
import { io,Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export default function getSocket() {
  if (!socketInstance) {
    // Create a new Socket.IO instance if not already created
    //@ts-expect-error - TODO: fix this
    socketInstance = io(`${import.meta.env.VITE_BACKEND_APP_API_BASE_URL}`, {
      transports: ['websocket'], // Optional, use WebSocket as the transport method
      autoConnect: false, // Optional: Disable auto connection
    });

    // Add event listeners to the socket instance
    socketInstance.on('connect', () => {
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      socketInstance = null; // Reset instance on disconnect
    });

    socketInstance.on('message', data => {
      console.log('Message from server:', data);
    });

    socketInstance.on('error', err => {
      console.error('Socket.IO error:', err);
    });

    // Connect the socket
    socketInstance.connect();
  }

  return socketInstance;
}
