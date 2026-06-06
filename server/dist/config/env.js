"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/mikflow',
    JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_for_development',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173'
};
