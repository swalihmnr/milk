"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFound = void 0;
const env_1 = require("../config/env");
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};
exports.notFound = notFound;
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: env_1.env.NODE_ENV === 'production' ? null : err.stack,
    });
};
exports.errorHandler = errorHandler;
