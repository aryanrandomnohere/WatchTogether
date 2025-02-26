"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = videoEvents;
const console_1 = require("console");
const roomManager_1 = require("../roomManager");
const db_1 = require("../db");
;
function videoEvents(io, socket) {
    socket.on("change-video", (_a) => __awaiter(this, [_a], void 0, function* ({ playing, roomId }) {
        try {
            let newPlaying;
            const room = roomManager_1.roomManager.getInstance().getRoom(roomId);
            if (room === null || room === void 0 ? void 0 : room.roomStatus) {
                room.roomStatus.playingId = playing.id;
                room.roomStatus.playingTitle = playing.title;
                room.roomStatus.playingType = playing.type;
                room.roomStatus.playingAnimeId = playing.animeId || undefined;
                newPlaying = { playingId: playing.id, playingTitle: playing.title, playingType: playing.type, playingAnimeId: playing.animeId };
                (0, console_1.log)("video data stored in the local vaiable and sent to the other subscribres");
                (0, console_1.log)(room.roomStatus);
            }
            else {
                newPlaying = yield db_1.prisma.room.update({
                    where: { userId: roomId },
                    data: {
                        playingId: playing.id,
                        playingTitle: playing.title,
                        playingType: playing.type,
                        playingAnimeId: playing.animeId,
                    },
                    select: {
                        playingId: true,
                        playingTitle: true,
                        playingType: true,
                        playingAnimeId: true,
                    }
                });
            }
            io.to(roomId).emit("receive-playing", newPlaying);
        }
        catch (error) {
            console.error("Error saving video:", error);
        }
    }));
    socket.on("change-ep", (episode, season, roomId) => __awaiter(this, void 0, void 0, function* () {
        try {
            const room = roomManager_1.roomManager.getInstance().getRoom(roomId);
            if (room === null || room === void 0 ? void 0 : room.roomStatus) {
                room.roomStatus.episode = episode;
                room.roomStatus.season = season;
                (0, console_1.log)("ep stored locally");
            }
            else {
                yield db_1.prisma.room.update({
                    where: {
                        userId: roomId
                    },
                    data: {
                        episode,
                        season
                    }
                });
            }
            io.to(roomId).emit("receive-ep", episode, season);
        }
        catch (error) {
            (0, console_1.log)(`Error while changing ep ${error}`);
        }
    }));
    socket.on("playPause", (_a) => __awaiter(this, [_a], void 0, function* ({ isPlaying, roomId }) {
        const room = roomManager_1.roomManager.getInstance().getRoom(roomId);
        if (room === null || room === void 0 ? void 0 : room.roomStatus) {
            room.roomStatus.isPlaying = isPlaying;
        }
        else {
            yield db_1.prisma.room.update({
                where: {
                    userId: roomId
                },
                data: {
                    isPlaying
                },
                select: {
                    isPlaying: true,
                }
            });
        }
        const playerRoom = roomId + "'s Player";
        io.to(playerRoom).emit("receivePlayPause", isPlaying);
        return;
    }));
    socket.on("seek", (_a) => __awaiter(this, [_a], void 0, function* ({ currentTime, roomId }) {
        const room = roomManager_1.roomManager.getInstance().getRoom(roomId);
        if (room === null || room === void 0 ? void 0 : room.roomStatus) {
            room.roomStatus.currentTime = currentTime;
        }
        else {
            yield db_1.prisma.room.update({
                where: {
                    userId: roomId
                },
                data: {
                    currentTime
                },
                select: {
                    currentTime: true
                }
            });
        }
        const playerRoom = roomId + "'s Player";
        io.to(playerRoom).emit("receiveSeek", { currentTime });
    }));
    socket.on("join-player", ({ roomId }) => {
        const playerRoom = roomId + "'s Player";
        socket.join(playerRoom);
    });
}
