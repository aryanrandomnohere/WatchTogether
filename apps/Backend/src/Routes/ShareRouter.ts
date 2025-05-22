// import express, { Request, Response } from 'express';
// import { RTCPeerConnection, RTCSessionDescription } from 'wrtc';
// import bodyParser from 'body-parser';
// const shareRouter = express.Router();

// let senderStream: any;
// shareRouter.use(bodyParser.json());
// shareRouter.use(bodyParser.urlencoded({ extended: true }));

// shareRouter.post("/consumer", async (req: Request, res: Response) => {
//     const peer = new RTCPeerConnection({
//         iceServers: [
//             {
//                 urls: "stun:stun.stunprotocol.org"
//             }
//         ]
//     });
//     const desc = new RTCSessionDescription(req.body.sdp);
//     await peer.setRemoteDescription(desc);
//     senderStream.getTracks().forEach((track: any) => peer.addTrack(track, senderStream));
//     const answer = await peer.createAnswer();
//     await peer.setLocalDescription(answer);
//     const payload = {
//         sdp: peer.localDescription
//     }

//     res.json(payload);
// });

// shareRouter.post('/broadcast', async (req: Request, res: Response) => {
//     const peer = new RTCPeerConnection({
//         iceServers: [
//             {
//                 urls: "stun:stun.stunprotocol.org"
//             }
//         ]
//     });
//     peer.ontrack = (e: any) => handleTrackEvent(e, peer);
//     const desc = new RTCSessionDescription(req.body.sdp);
//     await peer.setRemoteDescription(desc);
//     const answer = await peer.createAnswer();
//     await peer.setLocalDescription(answer);
//     const payload = {
//         sdp: peer.localDescription
//     }

//     res.json(payload);
// });

// function handleTrackEvent(e: any, peer: any) {
//     senderStream = e.streams[0];
// };


// export default shareRouter;
