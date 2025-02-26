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
const console_1 = require("console");
const db_1 = require("../db");
;
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
                message: true,
            },
        },
    };
    socket.on("send-message", (_a) => __awaiter(this, [_a], void 0, function* ({ type, time, message, options, roomId, multipleVotes = false, replyTo, displayname, }) {
        try {
            if (type === "normal") {
                const newMessage = yield db_1.prisma.chat.create({
                    data: { displayname, type, message, time, roomId },
                    select: messageSelect,
                });
                io.to(roomId).emit("receive-message", newMessage);
            }
            else if (type === "poll" && options) {
                try {
                    const newPoll = yield db_1.prisma.chat.create({
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
                    yield Promise.all(options.map((option) => db_1.prisma.pollOptions.create({
                        data: { option, chatId: newPoll.id },
                    })));
                    const newMessage = yield db_1.prisma.chat.findUnique({
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
                if (type == "replyTo" && replyTo) {
                    (0, console_1.log)("Its an Reply to message");
                    try {
                        const newMessage = yield db_1.prisma.chat.create({
                            data: {
                                message,
                                time,
                                roomId,
                                replyToId: replyTo,
                                type,
                                displayname
                            },
                            select: messageSelect
                        });
                        io.to(roomId).emit("receive-message", newMessage);
                    }
                    catch (error) {
                        console.error("Error saving message:", error);
                        socket.emit("error-saving-message", "Failed to save message.");
                    }
                }
                else {
                    socket.emit("error-saving-message", "Invalid message type or data.");
                }
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
            const chat = yield db_1.prisma.chat.findUnique({
                where: { id: chatId },
                select: { multipleVotes: true },
            });
            if (!chat) {
                throw new Error("Chat not found");
            }
            let newVote;
            let newPoll;
            // Check if a vote already exists for this user and chat
            const existingVote = yield db_1.prisma.vote.findFirst({
                where: { chatId, userId, optionId },
                select: { id: true },
            });
            if (chat.multipleVotes) {
                // Toggle the vote if multiple votes are allowed
                if (existingVote) {
                    const deletedVote = yield db_1.prisma.vote.delete({ where: { id: existingVote.id },
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
                    newPoll = yield db_1.prisma.chat.findUnique({
                        where: {
                            id: chatId
                        },
                        select: messageSelect
                    });
                    io.to(roomId).emit("new-poll", newPoll);
                    return;
                }
                newVote = yield db_1.prisma.vote.create({
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
                newPoll = yield db_1.prisma.chat.findUnique({
                    where: {
                        id: chatId
                    },
                    select: messageSelect
                });
            }
            else {
                // If multiple votes are not allowed, delete all user votes for this chat
                if (existingVote) {
                    const deletedVote = yield db_1.prisma.vote.delete({
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
                    newPoll = yield db_1.prisma.chat.findUnique({
                        where: {
                            id: chatId
                        },
                        select: messageSelect
                    });
                    io.to(roomId).emit("new-poll", newPoll);
                    return;
                }
                const deleteMany = yield db_1.prisma.vote.deleteMany({
                    where: { chatId, userId },
                });
                newVote = yield db_1.prisma.vote.create({
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
            newPoll = yield db_1.prisma.chat.findUnique({
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
    socket.on("deleteMessage", (_a) => __awaiter(this, [_a], void 0, function* ({ roomId, chatId }) {
        try {
            const deletedMessage = yield db_1.prisma.chat.delete({
                where: {
                    id: chatId
                },
                select: {
                    id: true,
                }
            });
            io.to(roomId).emit("receive-deletedMessage", deletedMessage.id);
        }
        catch (error) {
            (0, console_1.log)("Something went wrong while deleting msg", error);
        }
    }));
}
