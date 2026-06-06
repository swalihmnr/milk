"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.setTokenCookie = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const generateToken = (userId, roleNames) => {
    return jsonwebtoken_1.default.sign({ id: userId, roles: roleNames }, env_1.env.JWT_SECRET, {
        expiresIn: env_1.env.JWT_EXPIRES_IN,
    });
};
exports.generateToken = generateToken;
const setTokenCookie = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: env_1.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
};
exports.setTokenCookie = setTokenCookie;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
};
exports.verifyToken = verifyToken;
