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
const MediaRouter = express_1.default.Router();
const VALID_LIST_TYPES = ["Favourite", "Recently Watched", "Watch Later"];
// Get all media for a user
MediaRouter.get("/allmedia", AuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const userId = req.userId;
        const userMedia = yield db_1.prisma.userMovieList.findMany({
            where: { userId },
            select: {
                listType: true,
                episode: true,
                season: true,
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
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc", // Dynamically set based on `reverse`
            },
        });
        res.status(200).json({ message: "User media retrieved successfully.", data: userMedia });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: "An error occurred while retrieving media." });
    }
}));
//Remove from Favourite
MediaRouter.put("/removefavourite", AuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    try {
        const userId = req.userId;
        const { movieId, listType } = req.body;
        yield db_1.prisma.userMovieList.delete({
            where: {
                userId_Mid_listType: {
                    userId,
                    Mid: movieId, // assuming Mid is the field representing `movieId`
                    listType
                }
            }
        });
        res.status(201).json({ msg: "Removed from Favourites" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: "An error occurred while saving the movie." });
    }
}));
// Save or update media for a user
MediaRouter.post("/mediaaction", AuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const userId = req.userId;
        const { movie, listType } = req.body;
        // Validate the input
        if (!userId || !movie || !listType) {
            res.status(400).json({ msg: "Missing required fields: userId, movie, or listType." });
            return;
        }
        if (!VALID_LIST_TYPES.includes(listType)) {
            res.status(400).json({ msg: `Invalid listType. Valid options are: ${VALID_LIST_TYPES.join(", ")}` });
            return;
        }
        // Check if the movie already exists in the database
        let movieRecord = yield db_1.prisma.movie.findUnique({
            where: { id: movie.id },
            select: {
                Mid: true,
                id: true
            },
        });
        // If the movie does not exist, create it
        if (!movieRecord) {
            movieRecord = yield db_1.prisma.movie.create({
                data: {
                    id: movie.id,
                    adult: movie.adult,
                    title: movie.title,
                    backdrop_path: movie.backdrop_path,
                    first_air_date: movie.first_air_date,
                    media_type: movie.media_type,
                    name: movie.name,
                    original_language: movie.original_language,
                    original_name: movie.original_name,
                    overview: movie.overview,
                    popularity: movie.popularity,
                    poster_path: movie.poster_path,
                    vote_average: movie.vote_average,
                    vote_count: movie.vote_count,
                },
                select: { Mid: true,
                    id: true
                },
            });
            // Add genre IDs if provided
            if (movie.genre_ids && movie.genre_ids.length > 0) {
                yield Promise.all(movie.genre_ids.map((genreId) => db_1.prisma.genreIds.create({
                    data: {
                        //@ts-ignore
                        movieId: movieRecord.Mid,
                        genre_id: genreId,
                    },
                })));
            }
            // Add origin countries if provided
            if (movie.origin_country && movie.origin_country.length > 0) {
                yield Promise.all(movie.origin_country.map((country) => db_1.prisma.originCountry.create({
                    data: {
                        //@ts-ignore
                        movieId: movieRecord.Mid,
                        country,
                    },
                })));
            }
        }
        // Check if the user already added this movie with the same listType
        const existingEntry = yield db_1.prisma.userMovieList.findUnique({
            where: {
                userId_Mid_listType: {
                    userId,
                    Mid: movieRecord.id,
                    listType,
                },
            },
            select: {
                Mid: true,
                id: true
            }
        });
        if (existingEntry) {
            yield db_1.prisma.userMovieList.update({
                where: {
                    id: existingEntry.id,
                },
                data: {
                    createdAt: new Date()
                }
            });
            res.status(200).json({ msg: "This media already exists" });
            return;
        }
        // Create the user-movie relationship
        yield db_1.prisma.userMovieList.create({
            data: {
                userId,
                movieId: movieRecord.Mid,
                Mid: movieRecord.id,
                listType,
            },
        });
        res.status(201).json({ message: "Movie successfully added to the list.", movie: movieRecord });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
}));
//update 
MediaRouter.put("/setmedia", AuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized access" });
            return;
        }
        const { episode, season, movie_Id } = req.body;
        if (!episode || !season || !movie_Id || episode <= 0 || season <= 0) {
            res.status(400).json({ success: false, message: "Invalid input: episode, season, and movieId are required and must be valid numbers." });
            return;
        }
        // Attempt to update the entry
        const response = yield db_1.prisma.userMovieList.findUnique({
            where: {
                userId_Mid_listType: {
                    userId,
                    Mid: movie_Id,
                    listType: "Recently Watched",
                },
            },
        });
        if (response) {
            yield db_1.prisma.userMovieList.update({
                where: {
                    userId_Mid_listType: {
                        userId,
                        Mid: movie_Id,
                        listType: "Recently Watched",
                    },
                },
                data: {
                    episode,
                    season,
                },
            });
            res.status(200).json({ success: true, message: "Episode and season updated successfully." });
            return;
        }
        // Create a new entry if no matching update found
        const movie = yield db_1.prisma.movie.findUnique({
            where: { id: movie_Id },
            select: { Mid: true },
        });
        if (!movie) {
            res.status(404).json({ success: false, message: "Movie not found." });
            return;
        }
        yield db_1.prisma.userMovieList.create({
            data: {
                userId,
                listType: "Recently Watched",
                episode,
                season,
                Mid: movie_Id,
                movieId: movie.Mid,
            },
        });
        res.status(200).json({ success: true, message: "Movie relation made and episode and season updated" });
        return;
    }
    catch (error) {
        res.status(400).json({ msg: "Internal Server Error" });
    }
}));
exports.default = MediaRouter;
