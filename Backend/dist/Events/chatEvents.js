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
exports.default = chatEvents;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function chatEvents(io, socket) {
    socket.on("send-message", (_a) => __awaiter(this, [_a], void 0, function* ({ name, time, message, userId }) {
        try {
            const newMessage = yield prisma.chat.create({
                data: { name, message, time, userId },
            });
            io.to(userId).emit("receive-message", newMessage);
        }
        catch (error) {
            console.error("Error saving message:", error);
            socket.emit("error-saving-message", "Failed to save message.");
        }
    }));
}
