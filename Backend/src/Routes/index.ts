import express, {Request, Response} from 'express';
import authRouter from "./AuthRouter";
const mainRouter = express.Router();

mainRouter.use("/Auth", authRouter)
export default mainRouter;
