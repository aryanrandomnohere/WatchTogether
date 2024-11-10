import express, {Request, Response} from 'express';
import authRouter from "./AuthRouter";
import UserRouter from './UserRouter';
const mainRouter = express.Router();

mainRouter.use("/Auth", authRouter)
mainRouter.use("/user", UserRouter)
export default mainRouter;
