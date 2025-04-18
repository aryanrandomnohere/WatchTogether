"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = p2pEvents;
const roomManager_1 = require("../roomManager");
function p2pEvents(io, socket) {
    socket.on("initiate-offer", (roomId, userInfo, to, sdp) => {
        var _a, _b, _c, _d, _e, _f;
        console.log(roomId, userInfo, to, sdp, "initiate-offer");
        const room = roomManager_1.roomManager.getInstance().getRoom(roomId);
        if (!room) {
            socket.emit("initiate-offer-error", { msg: "Something went wrong" });
            return;
        }
        if (((_b = (_a = room.inCall) === null || _a === void 0 ? void 0 : _a.people) === null || _b === void 0 ? void 0 : _b.size) === 1) {
            const sdp = (_c = room.inCall) === null || _c === void 0 ? void 0 : _c.firstOffer;
            if (!sdp)
                return;
            io.to(userInfo.id).emit("initiate-offer", `${userInfo.displayname || userInfo.username} started a call`, sdp, userInfo.id);
            return;
        }
        if ((_f = (_e = (_d = roomManager_1.roomManager.getInstance().getRoom(roomId)) === null || _d === void 0 ? void 0 : _d.inCall) === null || _e === void 0 ? void 0 : _e.people) === null || _f === void 0 ? void 0 : _f.has(userInfo.id)) {
            io.to(userInfo.id).emit("multiple-call-error", "A call is already started cannot make an offer");
            return;
        }
        roomManager_1.roomManager.getInstance().joinCall(roomId, userInfo.id, sdp);
        if (!to)
            return;
        io.to(to).emit("initiate-offer", `${userInfo.displayname || userInfo.username} started a call`, sdp, userInfo.id);
    });
    socket.on("answer-created", (roomId, userId, forUserId, sdp) => {
        if (userId === forUserId)
            return null;
        io.to(userId).emit("answer-created", "", sdp);
    });
    socket.on('ice-candidate', ({ userId, to, candidate }) => {
        if (userId === to || to === null)
            return null;
        io.to(to).emit("ice-candidate", { from: userId, candidate });
        return;
    });
}
