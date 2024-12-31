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
    // Shared select clause for message fetching
    const messageSelect = {
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
                            },
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
    };
    socket.on("send-message", (_a) => __awaiter(this, [_a], void 0, function* ({ type, time, message, options, roomId, multipleVotes, replyTo, displayname, }) {
        try {
            if (type === "normal") {
                const newMessage = yield prisma.chat.create({
                    data: { displayname, type, message, time, roomId },
                    select: messageSelect,
                });
                io.to(roomId).emit("receive-message", newMessage);
            }
            else if (type === "poll" && options) {
                try {
                    const newPoll = yield prisma.chat.create({
                        data: {
                            type: "poll",
                            displayname,
                            message,
                            multipleVotes,
                            time,
                            roomId,
                        },
                        select: { id: true },
                    });
                    yield Promise.all(options.map((option) => prisma.pollOptions.create({
                        data: { option, chatId: newPoll.id },
                    })));
                    const newMessage = yield prisma.chat.findUnique({
                        where: { id: newPoll.id },
                        select: messageSelect,
                    });
                    io.to(roomId).emit("receive-message", newMessage);
                }
                catch (error) {
                    console.error("Error creating poll or options:", error);
                    socket.emit("error-saving-message", "Failed to create poll or options.");
                }
            }
            else {
                socket.emit("error-saving-message", "Invalid message type or data.");
            }
        }
        catch (error) {
            console.error("Error saving message:", error);
            socket.emit("error-saving-message", "Failed to save message.");
        }
    }));
    socket.on("new-vote", (_a) => __awaiter(this, [_a], void 0, function* ({ chatId, optionId, userId, roomId }) {
        try {
            // Fetch the chat details
            const chat = yield prisma.chat.findUnique({
                where: { id: chatId },
                select: { multipleVotes: true },
            });
            if (!chat) {
                throw new Error("Chat not found");
            }
            let newVote;
            let newPoll;
            // Check if a vote already exists for this user and chat
            const existingVote = yield prisma.vote.findFirst({
                where: { chatId, userId, optionId },
                select: { id: true },
            });
            if (chat.multipleVotes) {
                // Toggle the vote if multiple votes are allowed
                if (existingVote) {
                    const deletedVote = yield prisma.vote.delete({ where: { id: existingVote.id },
                        select: {
                            id: true,
                            userId: true,
                            chatId: true,
                            optionId: true,
                            user: {
                                select: {
                                    username: true,
                                    id: true,
                                    displayname: true,
                                }
                            }
                        } });
                    newPoll = yield prisma.chat.findUnique({
                        where: {
                            id: chatId
                        },
                        select: messageSelect
                    });
                    io.to(roomId).emit("new-poll", newPoll);
                    return;
                }
                newVote = yield prisma.vote.create({
                    data: { chatId, optionId, userId },
                    select: {
                        id: true,
                        chatId: true,
                        optionId: true,
                        user: {
                            select: {
                                username: true,
                                id: true,
                                displayname: true,
                            }
                        }
                    }
                });
                newPoll = yield prisma.chat.findUnique({
                    where: {
                        id: chatId
                    },
                    select: messageSelect
                });
            }
            else {
                // If multiple votes are not allowed, delete all user votes for this chat
                if (existingVote) {
                    const deletedVote = yield prisma.vote.delete({
                        where: { id: existingVote.id },
                        select: {
                            id: true,
                            userId: true,
                            chatId: true,
                            optionId: true,
                            user: {
                                select: {
                                    username: true,
                                    id: true,
                                    displayname: true,
                                }
                            }
                        }
                    });
                    newPoll = yield prisma.chat.findUnique({
                        where: {
                            id: chatId
                        },
                        select: messageSelect
                    });
                    io.to(roomId).emit("new-poll", newPoll);
                    return;
                }
                const deleteMany = yield prisma.vote.deleteMany({
                    where: { chatId, userId },
                });
                newVote = yield prisma.vote.create({
                    data: { chatId, optionId, userId },
                    select: {
                        id: true,
                        chatId: true,
                        optionId: true,
                        user: {
                            select: {
                                username: true,
                                id: true,
                                displayname: true,
                            }
                        }
                    }
                });
            }
            // Emit the new vote to all clients in the room
            newPoll = yield prisma.chat.findUnique({
                where: {
                    id: chatId
                },
                select: messageSelect
            });
            io.to(roomId).emit("new-poll", newPoll);
        }
        catch (error) {
            console.error("Error handling new vote:", error);
            socket.emit("error", "Failed to process vote.");
        }
    }));
}
