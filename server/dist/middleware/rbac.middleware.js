"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            res.status(403);
            return next(new Error('Not authorized to access this route'));
        }
        const hasRole = req.user.roles.some((role) => roles.includes(role));
        if (!hasRole) {
            res.status(403);
            return next(new Error(`User role is not authorized to access this route`));
        }
        next();
    };
};
exports.authorize = authorize;
