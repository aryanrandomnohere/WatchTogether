"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logInSchema = exports.signUpSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const signUpSchema = zod_1.default.object({
    firstname: zod_1.default.string(),
    lastname: zod_1.default.string(),
    username: zod_1.default.string(),
    password: zod_1.default.string(),
    email: zod_1.default.string().email(),
});
exports.signUpSchema = signUpSchema;
const logInSchema = zod_1.default.object({
    username: zod_1.default.string(),
    password: zod_1.default.string(),
});
exports.logInSchema = logInSchema;
