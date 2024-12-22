"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuthRouter_1 = __importDefault(require("./AuthRouter"));
const UserRouter_1 = __importDefault(require("./UserRouter"));
const SocialRouter_1 = __importDefault(require("./SocialRouter"));
const MediaRelation_1 = __importDefault(require("./MediaRelation"));
const mainRouter = express_1.default.Router();
mainRouter.use("/Auth", AuthRouter_1.default);
mainRouter.use("/user", UserRouter_1.default);
mainRouter.use("/social", SocialRouter_1.default);
mainRouter.use("/media", MediaRelation_1.default);
exports.default = mainRouter;
