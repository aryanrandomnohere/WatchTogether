import express, { Response, Request } from "express";
import { PrismaClient } from "@prisma/client";
import { sign } from "jsonwebtoken";
import bcrypt from "bcrypt";
import JWT_SECRET from "../JWT_SECRET";
import zod from 'zod'

const signUpSchema = zod.object({
    firstname: zod.string(),
    lastname:  zod.string(),
    username:  zod.string(),
    password:  zod.string(),
    email:     zod.string().email(),
})

const logInSchema =zod.object({
    email: zod.string(),
    password:zod.string(),
})

const authRouter = express.Router();
const prisma = new PrismaClient();
const SALT_ROUNDS = 10; // Number of salt rounds for bcrypt

// Signup endpoint
//@ts-ignore
authRouter.post("/signup", async (req: Request, res: Response) => {
   const  {email,firstname,lastname,password,username} = req.body;
    const credentials = {email,firstname,lastname,password,username}
    const { success, data } = signUpSchema.safeParse(credentials);
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
                firstname: data.firstname,
                lastname: data.lastname,
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
const {email, password} = req.body;
    const credential = {email, password}
    const { success, data } = logInSchema.safeParse(credential);
    if (!success) return res.status(400).json({ msg: "Invalid Input" });

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