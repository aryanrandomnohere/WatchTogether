import { Response, Request, NextFunction } from "express";
import pkg from "jsonwebtoken";
const { decode, verify } = pkg;
import JWT_SECRET from "./JWT_SECRET.js";

//@ts-ignore
function AuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const jwt = req.headers.authorization;
    if (!jwt) {
      res.status(401).json({ msg: "You are not logged in" });
      return;
    }

    const data = verify(jwt, JWT_SECRET);

    //@ts-ignore
    req.userId = data.userId;
    next(); // Move to the next middleware or route handler
  } catch (error) {
    // Return "Invalid request" if token verification fails
    res.status(400).json({ msg: "Invalid request" });
    return;
  }
}
export default AuthMiddleware;
