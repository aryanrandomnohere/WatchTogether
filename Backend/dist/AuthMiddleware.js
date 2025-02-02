"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
const JWT_SECRET_1 = __importDefault(require("./JWT_SECRET"));
//@ts-ignore
function AuthMiddleware(req, res, next) {
    try {
        const jwt = req.headers.authorization;
        if (!jwt) {
            res.status(401).json({ msg: "You are not logged in" });
            return;
        }
        const data = (0, jsonwebtoken_1.verify)(jwt, JWT_SECRET_1.default);
        //@ts-ignore
        req.userId = data.userId;
        next(); // Move to the next middleware or route handler
    }
    catch (error) {
        // Return "Invalid request" if token verification fails
        res.status(400).json({ msg: "Invalid request" });
        return;
    }
}
exports.default = AuthMiddleware;
