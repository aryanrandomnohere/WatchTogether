import express, { Response, Request, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import JWT_SECRET from "../JWT_SECRET";

const app = express();
//@ts-ignore
app.use("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jwt = req.header("authorization");
    if (!jwt) {
      return res.status(401).json({ msg: "You are not logged in" });
    }

    const data = verify(jwt, JWT_SECRET);
    
    console.log(data);
    
    
    next(); // Move to the next middleware or route handler
  } catch (error) {
    // Return "Invalid request" if token verification fails
    return res.status(400).json({ msg: "Invalid request" });
  }
});

export default app;
