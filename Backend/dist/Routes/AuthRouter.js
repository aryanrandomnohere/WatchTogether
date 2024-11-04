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
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = require("jsonwebtoken");
const bcrypt_1 = __importDefault(require("bcrypt"));
const JWT_SECRET_1 = __importDefault(require("../JWT_SECRET"));
// const signUpSchema = zod.object({
//     firstname: zod.string(),
//     lastname:  zod.string(),
//     username:  zod.string(),
//     password:  zod.string(),
//     email:     zod.string().email(),
// })
// const logInSchema =zod.object({
//     email: zod.string(),
//     password:zod.string(),
// })
const authRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const SALT_ROUNDS = 10; // Number of salt rounds for bcrypt
// Signup endpoint
//@ts-ignore
authRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, firstname, lastname, password, username } = req.body;
    const data = { email, firstname, lastname, password, username };
    // const { success, data } = signUpSchema.safeParse(credentials);
    // if (!success) return res.status(400).json({ msg: "Invalid Input" });
    try {
        // Check if user already exists
        const existingUser = yield prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser)
            return res.status(400).json({ msg: "User already exists" });
        // Hash the password
        const hashedPassword = yield bcrypt_1.default.hash(data.password, SALT_ROUNDS);
        // Create new user with hashed password
        const newUser = yield prisma.user.create({
            data: {
                email: data.email,
                firstname: data.firstname,
                lastname: data.lastname,
                password: hashedPassword, // Store the hashed password
                username: data.username,
            }
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
    const { email, password } = req.body;
    const data = { email, password };
    // const { success, data } = logInSchema.safeParse(req.body);
    // if (!success) return res.status(400).json({ msg: "Invalid Input" });
    try {
        const user = yield prisma.user.findUnique({ where: { email: data.email } });
        if (!user)
            return res.status(401).json({ msg: "Invalid credentials" });
        // Compare password with stored hashed password
        const isPasswordValid = yield bcrypt_1.default.compare(data.password, user.password);
        if (!isPasswordValid)
            return res.status(401).json({ msg: "Invalid credentials" });
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
