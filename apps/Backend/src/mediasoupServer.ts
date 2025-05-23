import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import * as mediasoup from "mediasoup";
import { types } from "mediasoup";

type Worker = types.Worker;
type Router = types.Router;
type WebRtcTransport = types.WebRtcTransport;
type Producer = types.Producer;
type Consumer = types.Consumer;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

// MediaSoup workers
const workers: Worker[] = [];
const rooms = new Map<
  string,
  {
    router: Router;
    peers: Map<
      string,
      {
        transports: Map<string, WebRtcTransport>;
        producers: Map<string, Producer>;
        consumers: Map<string, Consumer>;
      }
    >;
  }
>();

// Create MediaSoup workers
async function createWorkers() {
  const numWorkers = 1; // Use a single worker for now
  for (let i = 0; i < numWorkers; i++) {
    const worker = await mediasoup.createWorker({
      logLevel: "warn",
      rtcMinPort: 40000,
      rtcMaxPort: 49999,
    });
    workers.push(worker);
  }
}

// Create a new room
async function createRoom(roomId: string) {
  const worker = workers[0]; // Use first worker for now
  const router = await worker.createRouter({
    mediaCodecs: [
      {
        kind: "audio",
        mimeType: "audio/opus",
        clockRate: 48000,
        channels: 2,
      },
      {
        kind: "video",
        mimeType: "video/VP8",
        clockRate: 90000,
        parameters: {
          "x-google-start-bitrate": 2500,
          "x-google-min-bitrate": 1000,
          "x-google-max-bitrate": 5000,
        },
      },
      {
        kind: "video",
        mimeType: "video/H264",
        clockRate: 90000,
        parameters: {
          "packetization-mode": 1,
          "profile-level-id": "42e01f",
          "level-asymmetry-allowed": 1,
          "x-google-start-bitrate": 2500,
          "x-google-min-bitrate": 1000,
          "x-google-max-bitrate": 5000,
        },
      }
    ],
  });

  rooms.set(roomId, {
    router,
    peers: new Map(),
  });
}

// Socket.io event handlers
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join", async ({ roomId, peerId }) => {
    try {
      console.log(`Client ${peerId} attempting to join room ${roomId}`);
      
      if (!rooms.has(roomId)) {
        console.log(`Creating new room ${roomId}`);
        await createRoom(roomId);
      }

      const room = rooms.get(roomId)!;
      if (!room.peers.has(peerId)) {
        console.log(`Adding peer ${peerId} to room ${roomId}`);
        room.peers.set(peerId, {
          transports: new Map(),
          producers: new Map(),
          consumers: new Map(),
        });
      }

      socket.join(roomId);
      console.log(`Client ${peerId} joined room ${roomId}`);
      socket.emit("joined", { roomId, peerId });
    } catch (error) {
      console.error("Error joining room:", error);
      socket.emit("error", { error: "Failed to join room" });
    }
  });

  socket.on("getRouterRtpCapabilities", async ({ roomId }) => {
    try {
      console.log(`Getting router capabilities for room ${roomId}`);
      const room = rooms.get(roomId);
      if (!room) throw new Error("Room not found");

      socket.emit("routerRtpCapabilities", {
        rtpCapabilities: room.router.rtpCapabilities,
      });
      console.log(`Router capabilities sent for room ${roomId}`);
    } catch (error) {
      console.error("Error getting router capabilities:", error);
      socket.emit("error", { error: "Failed to get router capabilities" });
    }
  });

  socket.on("createWebRtcTransport", async ({ roomId, peerId }) => {
    try {
      console.log(`Creating WebRTC transport for peer ${peerId} in room ${roomId}`);
      const room = rooms.get(roomId);
      if (!room) throw new Error("Room not found");

      const transport = await room.router.createWebRtcTransport({
        listenIps: [
          {
            ip: "0.0.0.0",
            announcedIp: "127.0.0.1",
          },
        ],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
      });

      const peer = room.peers.get(peerId)!;
      peer.transports.set(transport.id, transport);

      console.log(`WebRTC transport created for peer ${peerId}`);
      socket.emit("transportCreated", {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      });
    } catch (error) {
      console.error("Error creating transport:", error);
      socket.emit("error", { error: "Failed to create transport" });
    }
  });

  socket.on(
    "connectTransport",
    async ({ roomId, peerId, transportId, dtlsParameters }) => {
      try {
        const room = rooms.get(roomId);
        if (!room) throw new Error("Room not found");

        const peer = room.peers.get(peerId)!;
        const transport = peer.transports.get(transportId)!;
        await transport.connect({ dtlsParameters });
      } catch (error) {
        console.error("Error connecting transport:", error);
        socket.emit("error", { error: "Failed to connect transport" });
      }
    },
  );

  socket.on(
    "produce",
    async ({ roomId, peerId, transportId, kind, rtpParameters }) => {
      try {
        const room = rooms.get(roomId);
        if (!room) throw new Error("Room not found");

        const peer = room.peers.get(peerId)!;
        const transport = peer.transports.get(transportId)!;
        const producer = await transport.produce({ kind, rtpParameters });

        peer.producers.set(producer.id, producer);

        // Notify other peers
        socket.to(roomId).emit("newProducer", {
          peerId,
          producerId: producer.id,
          kind,
        });

        socket.emit("produced", { id: producer.id });
      } catch (error) {
        console.error("Error producing:", error);
        socket.emit("error", { error: "Failed to produce" });
      }
    },
  );

  socket.on(
    "consume",
    async ({ roomId, peerId, transportId, producerId, rtpCapabilities }) => {
      try {
        const room = rooms.get(roomId);
        if (!room) throw new Error("Room not found");

        const peer = room.peers.get(peerId)!;
        const transport = peer.transports.get(transportId)!;

        if (!room.router.canConsume({ producerId, rtpCapabilities })) {
          throw new Error("Cannot consume");
        }

        const consumer = await transport.consume({
          producerId,
          rtpCapabilities,
          paused: true,
        });

        peer.consumers.set(consumer.id, consumer);

        socket.emit("consumed", {
          id: consumer.id,
          producerId,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
          type: consumer.type,
        });
      } catch (error) {
        console.error("Error consuming:", error);
        socket.emit("error", { error: "Failed to consume" });
      }
    },
  );

  socket.on("resumeConsumer", async ({ roomId, peerId, consumerId }) => {
    try {
      const room = rooms.get(roomId);
      if (!room) throw new Error("Room not found");

      const peer = room.peers.get(peerId)!;
      const consumer = peer.consumers.get(consumerId)!;
      await consumer.resume();
    } catch (error) {
      console.error("Error resuming consumer:", error);
      socket.emit("error", { error: "Failed to resume consumer" });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    // Clean up resources
    rooms.forEach((room, roomId) => {
      room.peers.forEach((peer, peerId) => {
        peer.transports.forEach((transport) => transport.close());
        peer.producers.forEach((producer) => producer.close());
        peer.consumers.forEach((consumer) => consumer.close());
      });
      room.router.close();
      rooms.delete(roomId);
    });
  });
});

// Start the server
async function startServer() {
  await createWorkers();
  httpServer.listen(4440, () => {
    console.log("MediaSoup server running on port 4440");
  });
}

startServer().catch(console.error);
