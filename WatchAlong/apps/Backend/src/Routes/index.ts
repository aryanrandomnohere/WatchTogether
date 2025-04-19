import express, {Request, Response} from 'express';
import authRouter from "./AuthRouter";
import UserRouter from './UserRouter';
import SocialRouter from './SocialRouter';
import MediaRouter from './MediaRelation';
import roomRouter from './roomRouter';
const mainRouter = express.Router();

mainRouter.use("/Auth", authRouter)
mainRouter.use("/user", UserRouter)
mainRouter.use("/social", SocialRouter)
mainRouter.use("/media", MediaRouter)
mainRouter.use("/room",roomRouter)
export default mainRouter;
