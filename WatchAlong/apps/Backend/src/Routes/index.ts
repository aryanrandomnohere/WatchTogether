import express, { Request, Response } from "express";
import authRouter from "./AuthRouter.js";
import UserRouter from "./UserRouter.js";
import SocialRouter from "./SocialRouter.js";
import MediaRouter from "./MediaRelation.js";
import roomRouter from "./roomRouter.js";
import shareRouter from "./ShareRouter.js";
const mainRouter = express.Router();

mainRouter.use("/Auth", authRouter);
mainRouter.use("/user", UserRouter);
mainRouter.use("/social", SocialRouter);
mainRouter.use("/media", MediaRouter);
mainRouter.use("/room", roomRouter);
mainRouter.use("/screenshare", shareRouter);
export default mainRouter;
