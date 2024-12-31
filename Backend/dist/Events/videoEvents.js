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
const client_1 = require("@prisma/client");
const console_1 = require("console");
const prisma = new client_1.PrismaClient();
function videoEvents(io, socket) {
    socket.on("change-video", (_a) => __awaiter(this, [_a], void 0, function* ({ playing, roomId }) {
        console.log(playing);
        (0, console_1.log)(roomId);
        try {
            const newPlaying = yield prisma.room.update({
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
            console.log(newPlaying);
            io.to(roomId).emit("receive-playing", newPlaying);
        }
        catch (error) {
            console.error("Error saving video:", error);
        }
    }));
    socket.on("change-ep", (episode, season, roomId) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield prisma.room.update({
                where: {
                    userId: roomId
                },
                data: {
                    episode,
                    season
                }
            });
            io.to(roomId).emit("receive-ep", episode, season);
        }
        catch (error) {
            (0, console_1.log)(`Error while changing ep ${error}`);
        }
    }));
    socket.on("playPause", (_a) => __awaiter(this, [_a], void 0, function* ({ isPlaying, roomId }) {
        const playingState = yield prisma.room.update({
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
        const playerRoom = roomId + "'s Player";
        io.to(playerRoom).emit("receivePlayPause", playingState === null || playingState === void 0 ? void 0 : playingState.isPlaying);
        return;
    }));
    socket.on("seek", (_a) => __awaiter(this, [_a], void 0, function* ({ currentTime, roomId }) {
        const timeState = yield prisma.room.update({
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
        (0, console_1.log)(`Sending updated time ${timeState.currentTime}`);
        const playerRoom = roomId + "'s Player";
        io.to(playerRoom).emit("receiveSeek", { currentTime: timeState.currentTime });
    }));
    socket.on("join-player", ({ roomId }) => {
        const playerRoom = roomId + "'s Player";
        socket.join(playerRoom);
    });
}
