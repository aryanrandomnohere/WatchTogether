"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = p2pEvents;
const console_1 = require("console");
let senderId = null;
let receiverIds = null;
function p2pEvents(io, socket) {
    socket.on("initiate-offer", (roomId, userInfo, peoples, sdp) => {
        (0, console_1.log)("frontend is hitting");
        if (receiverIds === null || receiverIds === void 0 ? void 0 : receiverIds.includes(userInfo.id)) {
            io.to(userInfo.id).emit("multiple-call-error", "A call is already started cannot make an offer");
            return;
        }
        senderId = userInfo.id;
        receiverIds = peoples.filter((people) => people !== userInfo.id);
        if (receiverIds.length < 1)
            return;
        for (let receiver of receiverIds) {
            (0, console_1.log)("sending-iniated-offer", receiver);
            io.to(receiver).emit("initiate-offer", `${userInfo.displayname || userInfo.username} started a call`, sdp);
        }
    });
    socket.on("answer-created", (roomId, userId, sdp) => {
        if (senderId == userId) {
            console.log(senderId, userId);
            return;
        }
        if (!senderId) {
            io.to(userId).emit("create-answer-error", "Call initiator ended the call or some internal server error");
            return;
        }
        if (receiverIds && (receiverIds === null || receiverIds === void 0 ? void 0 : receiverIds.length) > 1) {
            const otherReceivers = receiverIds.filter((receiver) => {
                receiver !== userId;
            });
            for (let receiver of otherReceivers) {
                if (receiver == userId)
                    return;
                console.log(`sending to ${receiver}`);
                io.to(receiver).emit("answer-created", `${userId} accepted the call`, sdp);
            }
        }
        console.log(senderId);
        io.to(senderId).emit("answer-created", `${userId} accepted the call`, sdp);
    });
    socket.on('ice-candidate', ({ userId, candidate }) => {
        if (userId === senderId) {
            if (!receiverIds || (receiverIds === null || receiverIds === void 0 ? void 0 : receiverIds.length) == 0)
                return;
            for (let receiver of receiverIds) {
                io.to(receiver).emit("receiver-ice-candidate", candidate);
            }
            return;
        }
        if (receiverIds === null || receiverIds === void 0 ? void 0 : receiverIds.includes(userId)) {
            const otherReceivers = receiverIds.filter((receiver) => {
                receiver !== userId;
            });
            if (otherReceivers.length > 0) {
                for (let receiver of otherReceivers) {
                    io.to(receiver).emit("receiver-ice-candidate", candidate);
                }
            }
            if (!senderId)
                return;
            io.to(senderId).emit("sender-ice-candidate", candidate);
        }
    });
}
