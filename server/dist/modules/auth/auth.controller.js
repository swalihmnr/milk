"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.updateProfile = exports.getMe = exports.logout = exports.login = exports.signup = void 0;
const User_1 = __importDefault(require("../../models/User"));
const Role_1 = __importDefault(require("../../models/Role"));
const UserRole_1 = __importDefault(require("../../models/UserRole"));
const DeliveryBoy_1 = __importDefault(require("../../models/DeliveryBoy"));
const hash_1 = require("../../utils/hash");
const jwt_1 = require("../../utils/jwt");
const signup = async (req, res, next) => {
    try {
        const { name, phone, email, password, role, farmName, addressLine, village, city, state, herdSize, lat, lon } = req.body;
        // Check if user exists
        const userExists = await User_1.default.findOne({ phone });
        if (userExists) {
            res.status(400);
            throw new Error('User already exists with this phone number');
        }
        // Check if role exists
        let userRole = await Role_1.default.findOne({ name: role });
        if (!userRole) {
            userRole = await Role_1.default.create({ name: role, description: `Role for ${role}`, permissions: [] });
        }
        const hashedPassword = await (0, hash_1.hashPassword)(password);
        const user = await User_1.default.create({
            name,
            phone,
            email: email || undefined,
            passwordHash: hashedPassword,
            status: 'active',
            // Farmer-specific fields (only saved if role is farmer)
            ...(role === 'farmer' && {
                farmName: farmName || undefined,
                addressLine: addressLine || undefined,
                village: village || undefined,
                city: city || undefined,
                state: state || undefined,
                herdSize: herdSize ? Number(herdSize) : undefined,
            }),
            // Save location for both farmers and drivers
            ...(['farmer', 'delivery', 'delivery_boy'].includes(role) && {
                lat: lat ? Number(lat) : undefined,
                lon: lon ? Number(lon) : undefined,
            })
        });
        await UserRole_1.default.create({
            userId: user._id,
            roleId: userRole._id
        });
        if (role === 'delivery' || role === 'delivery_boy') {
            await DeliveryBoy_1.default.create({
                userId: user._id,
                vehicleType: 'Bicycle',
                isActive: true,
                isVerified: false
            });
        }
        const token = (0, jwt_1.generateToken)(user.id, [userRole.name]);
        (0, jwt_1.setTokenCookie)(res, token);
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                roles: [userRole.name],
                isVerified: (role === 'delivery' || role === 'delivery_boy') ? false : true,
                ...(role === 'farmer' && { farmName: user.farmName, village: user.village, city: user.city, state: user.state, herdSize: user.herdSize })
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.signup = signup;
const login = async (req, res, next) => {
    try {
        const { phone, password } = req.body;
        const user = await User_1.default.findOne({ phone });
        if (!user) {
            res.status(401);
            throw new Error('Invalid credentials');
        }
        if (user.status !== 'active') {
            res.status(403);
            throw new Error(`Account is ${user.status}`);
        }
        const isMatch = await (0, hash_1.comparePassword)(password, user.passwordHash);
        if (!isMatch) {
            res.status(401);
            throw new Error('Invalid credentials');
        }
        const userRoles = await UserRole_1.default.find({ userId: user._id }).populate('roleId');
        const roleNames = userRoles.map((ur) => ur.roleId.name);
        user.lastLoginAt = new Date();
        user.failedLoginAttempts = 0;
        await user.save();
        const token = (0, jwt_1.generateToken)(user.id, roleNames);
        (0, jwt_1.setTokenCookie)(res, token);
        let isVerified = true;
        if (roleNames.some(r => ['delivery', 'delivery_boy'].includes(r))) {
            const dboy = await DeliveryBoy_1.default.findOne({ userId: user._id });
            isVerified = dboy ? dboy.isVerified : false;
        }
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                roles: roleNames,
                isVerified
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const logout = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
};
exports.logout = logout;
const getMe = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401);
            throw new Error('Not authenticated');
        }
        const user = await User_1.default.findById(req.user.id).select('-passwordHash');
        const userRoles = await UserRole_1.default.find({ userId: req.user.id }).populate('roleId');
        const roleNames = userRoles.map((ur) => ur.roleId?.name).filter(Boolean);
        let isVerified = true;
        if (roleNames.some(r => ['delivery', 'delivery_boy'].includes(r))) {
            const dboy = await DeliveryBoy_1.default.findOne({ userId: req.user.id });
            isVerified = dboy ? dboy.isVerified : false;
        }
        // Merge user document with role for the frontend
        const data = {
            ...user?.toObject(),
            role: roleNames[0] || 'farmer',
            roles: roleNames,
            isVerified
        };
        res.status(200).json({ data });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
const updateProfile = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401);
            throw new Error('Not authenticated');
        }
        const allowedFields = ['name', 'email', 'phone', 'farmName', 'addressLine', 'village', 'city', 'state', 'herdSize', 'lat', 'lon'];
        const updates = {};
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined && req.body[field] !== '') {
                updates[field] = field === 'herdSize' || field === 'lat' || field === 'lon'
                    ? Number(req.body[field])
                    : req.body[field];
            }
        });
        const user = await User_1.default.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select('-passwordHash');
        res.status(200).json({ data: user });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
const forgotPassword = async (req, res, next) => {
    try {
        const { phone } = req.body;
        const user = await User_1.default.findOne({ phone });
        if (!user) {
            res.status(404);
            throw new Error('No user found with this phone number');
        }
        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Set expiration to 10 minutes from now
        const expires = new Date();
        expires.setMinutes(expires.getMinutes() + 10);
        user.resetPasswordOTP = otp;
        user.resetPasswordExpires = expires;
        await user.save();
        // In a real application, you would send this OTP via SMS.
        // For development, we return it in the response.
        res.status(200).json({
            message: 'OTP sent successfully',
            otp: otp // Return for testing/demo purposes
        });
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res, next) => {
    try {
        const { phone, otp, password } = req.body;
        const user = await User_1.default.findOne({
            phone,
            resetPasswordOTP: otp,
            resetPasswordExpires: { $gt: new Date() } // Ensure OTP has not expired
        });
        if (!user) {
            res.status(400);
            throw new Error('Invalid or expired OTP');
        }
        // Hash new password
        const hashedPassword = await (0, hash_1.hashPassword)(password);
        user.passwordHash = hashedPassword;
        // Clear OTP fields
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpires = undefined;
        // Also reset any failed login attempts/locks
        user.failedLoginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();
        res.status(200).json({ message: 'Password reset successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.resetPassword = resetPassword;
