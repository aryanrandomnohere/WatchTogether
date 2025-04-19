import express, { Response, Request } from "express";
import { PrismaClient } from "@prisma/client";
import { sign } from "jsonwebtoken";
import bcrypt from "bcrypt";
import JWT_SECRET from "../JWT_SECRET";
import zod from 'zod'
import rateLimit from "express-rate-limit";
import { prisma } from "../db";

const signUpSchema = zod.object({
    displayname: zod.string(),
    username:  zod.string(),
    password:  zod.string(),
    email:     zod.string().email(),
})

const logInSchema =zod.object({
    email: zod.string(),
    password:zod.string(),
})
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10,  // ⬅️ Reduced to 5 requests per 15 minutes
    message: { msg: "Too many login attempts. Please try again later." },
    standardHeaders: true, // ⬅️ Use latest standard headers
    legacyHeaders: false,
    skipSuccessfulRequests: true, // ⬅️ Allows users to log in/signup again if they succeed
});
const authRouter = express.Router();
const SALT_ROUNDS = 10; // Number of salt rounds for bcrypt
authRouter.use(authLimiter);
// Signup endpoint
//@ts-ignore
authRouter.post("/signup", async (req: Request, res: Response) => {
   const  {email,displayname,password,username} = req.body;
    const { success, data } = signUpSchema.safeParse({email,displayname,password,username});
    if (!success) return res.status(400).json({ msg: "Invalid Input" });

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) return res.status(400).json({ msg: "User already exists" });

        // Hash the password
        const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

        // Create new user with hashed password
        const newUser = await prisma.user.create({
            data: {
                email: data.email,
                displayname : data.displayname,
                password: hashedPassword, // Store the hashed password
                username: data.username,
            }
        });

       await prisma.room.create({data: {userId:newUser.id}
    }) 

        // Generate JWT token
        const token = sign({ userId: newUser.id, username: newUser.username}, JWT_SECRET);
        return res.status(201).json({ msg: "Signup Successful", token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Internal Server Error" });
    }
});

// Login endpoint
//@ts-ignore
authRouter.post("/login", async (req: Request, res: Response) => {
const {email, password, token} = req.body;
    const credential = {email, password}
    const { success, data } = logInSchema.safeParse(credential);
    
    if (!success) return res.status(400).json({ msg: "Invalid Input" })
    try {
        const user = await prisma.user.findUnique({ where: { email: data.email } });
        if (!user) return res.status(401).json({ msg: "Email does not exists" });

        // Compare password with stored hashed password
        const isPasswordValid = await bcrypt.compare(data.password, user.password);
        if (!isPasswordValid) return res.status(401).json({ msg: "Invalid Password" });

        // Generate JWT token
        const token = sign({ userId: user.id, username: user.username }, JWT_SECRET);
        return res.status(200).json({ msg: "Login Successful", token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Internal Server Error" });
    }
});

export default authRouter;
