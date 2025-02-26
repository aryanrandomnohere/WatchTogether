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
const jsonwebtoken_1 = require("jsonwebtoken");
const bcrypt_1 = __importDefault(require("bcrypt"));
const JWT_SECRET_1 = __importDefault(require("../JWT_SECRET"));
const zod_1 = __importDefault(require("zod"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const db_1 = require("../db");
const signUpSchema = zod_1.default.object({
    displayname: zod_1.default.string(),
    username: zod_1.default.string(),
    password: zod_1.default.string(),
    email: zod_1.default.string().email(),
});
const logInSchema = zod_1.default.object({
    email: zod_1.default.string(),
    password: zod_1.default.string(),
});
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10, // ⬅️ Reduced to 5 requests per 15 minutes
    message: { msg: "Too many login attempts. Please try again later." },
    standardHeaders: true, // ⬅️ Use latest standard headers
    legacyHeaders: false,
    skipSuccessfulRequests: true, // ⬅️ Allows users to log in/signup again if they succeed
});
const authRouter = express_1.default.Router();
const SALT_ROUNDS = 10; // Number of salt rounds for bcrypt
authRouter.use(authLimiter);
// Signup endpoint
//@ts-ignore
authRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, displayname, password, username } = req.body;
    const { success, data } = signUpSchema.safeParse({ email, displayname, password, username });
    if (!success)
        return res.status(400).json({ msg: "Invalid Input" });
    try {
        // Check if user already exists
        const existingUser = yield db_1.prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser)
            return res.status(400).json({ msg: "User already exists" });
        // Hash the password
        const hashedPassword = yield bcrypt_1.default.hash(data.password, SALT_ROUNDS);
        // Create new user with hashed password
        const newUser = yield db_1.prisma.user.create({
            data: {
                email: data.email,
                displayname: data.displayname,
                password: hashedPassword, // Store the hashed password
                username: data.username,
            }
        });
        yield db_1.prisma.room.create({ data: { userId: newUser.id }
        });
        // Generate JWT token
        const token = (0, jsonwebtoken_1.sign)({ userId: newUser.id, username: newUser.username }, JWT_SECRET_1.default);
        return res.status(201).json({ msg: "Signup Successful", token });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Internal Server Error" });
    }
}));
// Login endpoint
//@ts-ignore
authRouter.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, token } = req.body;
    const credential = { email, password };
    const { success, data } = logInSchema.safeParse(credential);
    if (!success)
        return res.status(400).json({ msg: "Invalid Input" });
    try {
        const user = yield db_1.prisma.user.findUnique({ where: { email: data.email } });
        if (!user)
            return res.status(401).json({ msg: "Email does not exists" });
        // Compare password with stored hashed password
        const isPasswordValid = yield bcrypt_1.default.compare(data.password, user.password);
        if (!isPasswordValid)
            return res.status(401).json({ msg: "Invalid Password" });
        // Generate JWT token
        const token = (0, jsonwebtoken_1.sign)({ userId: user.id, username: user.username }, JWT_SECRET_1.default);
        return res.status(200).json({ msg: "Login Successful", token });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Internal Server Error" });
    }
}));
exports.default = authRouter;
