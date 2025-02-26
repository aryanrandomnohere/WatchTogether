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
const express_1 = __importDefault(require("express"));
const AuthMiddleware_1 = __importDefault(require("../AuthMiddleware"));
const db_1 = require("../db");
const SocialRouter = express_1.default.Router();
SocialRouter.use(AuthMiddleware_1.default);
SocialRouter.put("/rejectrequest", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const toId = req.userId;
    const { from } = req.body;
    if (!from) {
        res.status(400).json({ msg: "Missing required fields" });
        return;
    }
    try {
        // Find the friend request
        const friendRequest = yield db_1.prisma.friendRequests.findFirst({
            where: { toId, from },
            select: { id: true },
        });
        if (!friendRequest) {
            res.status(404).json({ msg: "Invalid request" });
            return;
        }
        // Delete the friend request
        const deletedRequest = yield db_1.prisma.friendRequests.delete({
            where: { id: friendRequest.id },
        });
        const fromUsername = deletedRequest.fromUsername;
        res.json({ fromUsername });
    }
    catch (error) {
        console.error("Error rejecting friend request:", error);
        res.status(500).json({ msg: "An error occurred while rejecting the request" });
    }
}));
SocialRouter.get("/friends", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.userId;
    const userFriends = yield db_1.prisma.friendship.findMany({
        where: {
            userId
        },
        select: {
            friendId: true
        }
    });
    const friendIds = userFriends.map(f => f.friendId);
    const mutualFriends = yield db_1.prisma.friendship.findMany({
        where: {
            userId: { in: friendIds },
            friendId: userId,
        },
        include: {
            user: {
                select: {
                    username: true,
                    id: true,
                    displayname: true,
                    status: true,
                },
            },
        },
    });
    const actualFriends = mutualFriends.map(f => f.user);
    res.json({ actualFriends });
    return;
}));
SocialRouter.get('/loadrequests', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.userId;
    const noti = yield db_1.prisma.friendRequests.findMany({
        where: { toId: userId },
        select: { from: true,
            fromUsername: true,
        }
    });
    res.json({ noti });
    return;
}));
exports.default = SocialRouter;
