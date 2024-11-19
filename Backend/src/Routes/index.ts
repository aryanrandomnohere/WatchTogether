import express, {Request, Response} from 'express';
import authRouter from "./AuthRouter";
import UserRouter from './UserRouter';
import SocialRouter from './SocialRouter';
const mainRouter = express.Router();

mainRouter.use("/Auth", authRouter)
mainRouter.use("/user", UserRouter)
mainRouter.use("/social", SocialRouter)
export default mainRouter;
