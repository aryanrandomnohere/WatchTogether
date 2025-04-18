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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AuthMiddleware_1 = __importDefault(require("../AuthMiddleware"));
const express_1 = __importDefault(require("express"));
const roomManager_1 = require("../roomManager");
const db_1 = require("../db");
const roomRouter = express_1.default.Router();
roomRouter.use(AuthMiddleware_1.default);
roomRouter.get("/loadstate/:roomId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roomId = req.params.roomId;
        let playing;
        const room = roomManager_1.roomManager.getInstance().getRoom(roomId);
        if (room === null || room === void 0 ? void 0 : room.roomStatus) {
            const { playingId, playingTitle, playingType, playingAnimeId } = room === null || room === void 0 ? void 0 : room.roomStatus;
            playing = { playingId, playingTitle, playingType, playingAnimeId };
            console.log("local variable used to fetch");
        }
        else {
            playing = yield db_1.prisma.room.findFirst({
                where: {
                    userId: roomId,
                },
                select: {
                    playingId: true,
                    playingTitle: true,
                    playingType: true,
                    playingAnimeId: true,
                },
            });
            console.log("db variable used to fetch");
        }
        const Messages = yield db_1.prisma.chat.findMany({
            where: { roomId },
            orderBy: { createdAt: "desc" },
            take: 15,
            select: {
                id: true,
                type: true,
                displayname: true,
                edited: true,
                multipleVotes: true,
                time: true,
                message: true,
                options: {
                    select: {
                        chatId: true,
                        option: true,
                        id: true,
                        votes: {
                            select: {
                                chatId: true,
                                id: true,
                                user: {
                                    select: {
                                        id: true,
                                        displayname: true,
                                        username: true,
                                    }
                                },
                                optionId: true,
                            },
                        },
                    },
                },
                replyTo: {
                    select: {
                        id: true,
                        displayname: true,
                        edited: true,
                        time: true,
                        message: true,
                    },
                },
            },
        });
        const oldMessages = Messages.reverse();
        res.status(200).json({ oldMessages, playing });
    }
    catch (error) {
        res.status(400).json({
            msg: "error while loading room state"
        });
    }
}));
//@ts-ignore
roomRouter.get("/currentState/:roomId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const roomId = req.params.roomId;
        let pastState;
        const room = roomManager_1.roomManager.getInstance().getRoom(roomId);
        if (room === null || room === void 0 ? void 0 : room.roomStatus) {
            const { isPlaying, currentTime } = room === null || room === void 0 ? void 0 : room.roomStatus;
            pastState = { isPlaying, currentTime };
            console.log("local variable used to fetch");
        }
        else {
            pastState = yield db_1.prisma.room.findFirst({
                where: {
                    userId: roomId
                },
                select: {
                    isPlaying: true,
                    currentTime: true,
                }
            });
        }
        res.status(200).json({
            isPlaying: pastState === null || pastState === void 0 ? void 0 : pastState.isPlaying,
            currentTime: pastState === null || pastState === void 0 ? void 0 : pastState.currentTime
        });
    }
    catch (error) {
        res.status(400).json({ msg: "Problem faced while loading the last state" });
    }
}));
roomRouter.get("/getRoomName/:roomId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roomId = req.params.roomId;
        const roomDetails = yield db_1.prisma.user.findFirst({
            where: {
                id: roomId
            },
            select: {
                username: true,
                displayname: true,
            }
        });
        res.status(200).json({
            roomDetails
        });
    }
    catch (error) {
        res.status(400).json({
            msg: "Either you are not looged in or internal server error"
        });
    }
}));
roomRouter.get("/call/:roomId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const roomId = req.params.roomId;
        const room = roomManager_1.roomManager.getInstance().getRoom(roomId);
        if (!room) {
            res.status(400).json({ msg: "Room not found" });
            return;
        }
        // Convert Set to array of strings
        const stringArray = ((_a = room.inCall) === null || _a === void 0 ? void 0 : _a.people) ? Array.from(room.inCall.people) : [];
        res.status(200).json(stringArray);
    }
    catch (error) {
        res.status(400).json({ msg: "Internal server error" });
    }
}));
exports.default = roomRouter;
