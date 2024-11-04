"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuthRouter_1 = __importDefault(require("./AuthRouter"));
const mainRouter = express_1.default.Router();
mainRouter.use("/Auth", AuthRouter_1.default);
exports.default = mainRouter;
