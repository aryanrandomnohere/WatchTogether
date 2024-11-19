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
const client_1 = require("@prisma/client");
const SocialRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
SocialRouter.put("/rejectrequest", AuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const toId = req.userId;
    const { from } = req.body;
    if (!from) {
        res.status(400).json({ msg: "Missing required fields" });
        return;
    }
    try {
        // Find the friend request
        const friendRequest = yield prisma.friendRequests.findFirst({
            where: { toId, from },
            select: { id: true },
        });
        if (!friendRequest) {
            res.status(404).json({ msg: "Invalid request" });
            return;
        }
        // Delete the friend request
        const deletedRequest = yield prisma.friendRequests.delete({
            where: { id: friendRequest.id },
        });
        res.json({ msg: `You rejected ${deletedRequest.fromUsername}'s friend request` });
    }
    catch (error) {
        console.error("Error rejecting friend request:", error);
        res.status(500).json({ msg: "An error occurred while rejecting the request" });
    }
}));
exports.default = SocialRouter;
