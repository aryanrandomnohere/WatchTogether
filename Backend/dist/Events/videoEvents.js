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
const prisma = new client_1.PrismaClient();
function videoEvents(io, socket) {
    socket.on("change-video", (_a) => __awaiter(this, [_a], void 0, function* ({ playing, roomId }) {
        console.log(playing);
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
}
