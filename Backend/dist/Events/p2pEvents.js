"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = p2pEvents;
const console_1 = require("console");
let senderId = null;
let receiverIds = null;
function p2pEvents(io, socket) {
    socket.on("initiate-offer", (roomId, userInfo, peoples, sdp) => {
        (0, console_1.log)(roomId, userInfo, sdp, peoples);
        if (receiverIds === null || receiverIds === void 0 ? void 0 : receiverIds.includes(userInfo.id)) {
            io.to(userInfo.id).emit("multiple-call-error", "A call is already started cannot make an offer");
            return;
        }
        senderId = userInfo.id;
        receiverIds = peoples.filter((people) => people !== userInfo.id);
        if (receiverIds.length < 1)
            return;
        for (let receiver of receiverIds) {
            (0, console_1.log)(`sending to ${receiver}`);
            io.to(receiver).emit("offer-made", `${userInfo.username} started a call`, sdp);
        }
    });
}
