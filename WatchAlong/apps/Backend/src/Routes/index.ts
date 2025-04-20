import express, {Request, Response} from 'express';
import authRouter from "./AuthRouter.js";
import UserRouter from './UserRouter.js';
import SocialRouter from './SocialRouter.js';
import MediaRouter from './MediaRelation.js';
import roomRouter from './roomRouter.js';
const mainRouter = express.Router();

mainRouter.use("/Auth", authRouter)
mainRouter.use("/user", UserRouter)
mainRouter.use("/social", SocialRouter)
mainRouter.use("/media", MediaRouter)
mainRouter.use("/room",roomRouter)
export default mainRouter;
