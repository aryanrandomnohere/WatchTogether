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
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const AuthMiddleware_1 = __importDefault(require("../AuthMiddleware"));
const UserRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
UserRouter.get("/getuser", AuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const id = req.userId;
    try {
        const userWithMovies = yield prisma.user.findUnique({
            where: {
                id
            },
            select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
                displayname: true,
                Movies: {
                    select: {
                        listType: true,
                        movie: {
                            select: {
                                id: true,
                                adult: true,
                                title: true,
                                backdrop_path: true,
                                first_air_date: true,
                                media_type: true,
                                name: true,
                                original_language: true,
                                original_name: true,
                                overview: true,
                                popularity: true,
                                poster_path: true,
                                vote_average: true,
                                vote_count: true,
                                genre_ids: {
                                    select: {
                                        genre_id: true,
                                    },
                                },
                                origin_country: {
                                    select: {
                                        country: true,
                                    }
                                },
                            },
                        },
                    },
                },
            },
        });
        res.status(201).json({ userWithMovies });
    }
    catch (e) {
        res.status(404).json({ msg: "There was some loading details" });
        return;
    }
    return;
}));
exports.default = UserRouter;
