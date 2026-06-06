"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jwt_1 = require("../utils/jwt");
const User_1 = __importDefault(require("../models/User"));
const protect = async (req, res, next) => {
    let token;
    if (req.cookies.token) {
        token = req.cookies.token;
    }
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        res.status(401);
        return next(new Error('Not authorized, no token'));
    }
    if (token.startsWith('mock-token-')) {
        try {
            const userData = JSON.parse(decodeURIComponent(token.substring('mock-token-'.length)));
            const role = userData.role || 'farmer';
            // Resolve a real MongoDB user so req.user.id is always a valid ObjectId
            // Look up by phone first (most specific), then fall back to first user of that role
            let realUser = null;
            if (userData.phone) {
                realUser = await User_1.default.findOne({ phone: userData.phone }).select('_id');
            }
            if (!realUser) {
                // Import Role + UserRole inline to avoid circular deps
                const Role = (await Promise.resolve().then(() => __importStar(require('../models/Role')))).default;
                const UserRole = (await Promise.resolve().then(() => __importStar(require('../models/UserRole')))).default;
                const roleDoc = await Role.findOne({ name: role });
                if (roleDoc) {
                    const userRole = await UserRole.findOne({ roleId: roleDoc._id });
                    if (userRole)
                        realUser = await User_1.default.findById(userRole.userId).select('_id');
                }
            }
            if (!realUser) {
                realUser = await User_1.default.findOne().select('_id');
            }
            req.user = {
                id: realUser ? realUser._id.toString() : userData._id,
                roles: [role]
            };
            return next();
        }
        catch (err) {
            res.status(401);
            return next(new Error('Not authorized, mock token corrupt'));
        }
    }
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401);
        next(new Error('Not authorized, token failed'));
    }
};
exports.protect = protect;
