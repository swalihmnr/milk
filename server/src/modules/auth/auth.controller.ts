import { Request, Response, NextFunction } from 'express';
import User from '../../models/User';
import Role from '../../models/Role';
import UserRole from '../../models/UserRole';
import DeliveryBoy from '../../models/DeliveryBoy';
import { hashPassword, comparePassword } from '../../utils/hash';
import { generateToken, setTokenCookie } from '../../utils/jwt';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phone, email, password, role, farmName, addressLine, village, city, state, herdSize, lat, lon } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ phone });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this phone number');
    }

    // Check if role exists
    let userRole = await Role.findOne({ name: role });
    if (!userRole) {
      userRole = await Role.create({ name: role, description: `Role for ${role}`, permissions: [] });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
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

    await UserRole.create({
      userId: user._id,
      roleId: userRole._id
    });

    if (role === 'delivery' || role === 'delivery_boy') {
      await DeliveryBoy.create({
        userId: user._id,
        vehicleType: 'Bicycle',
        isActive: true,
        isVerified: false
      });
    }

    const token = generateToken(user.id, [userRole.name]);
    setTokenCookie(res, token);

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
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });
    if (!user) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    if (user.status !== 'active') {
      res.status(403);
      throw new Error(`Account is ${user.status}`);
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    const userRoles = await UserRole.find({ userId: user._id }).populate('roleId');
    const roleNames = userRoles.map((ur: any) => ur.roleId.name);

    user.lastLoginAt = new Date();
    user.failedLoginAttempts = 0;
    await user.save();

    const token = generateToken(user.id, roleNames);
    setTokenCookie(res, token);

    let isVerified = true;
    if (roleNames.some(r => ['delivery', 'delivery_boy'].includes(r))) {
      const dboy = await DeliveryBoy.findOne({ userId: user._id });
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
  } catch (error) {
    next(error);
  }
};

export const logout = (req: Request, res: Response) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authenticated');
    }
    const user = await User.findById(req.user.id).select('-passwordHash');
    const userRoles = await UserRole.find({ userId: req.user.id }).populate('roleId');
    const roleNames = userRoles.map((ur: any) => ur.roleId?.name).filter(Boolean);
    
    let isVerified = true;
    if (roleNames.some(r => ['delivery', 'delivery_boy'].includes(r))) {
      const dboy = await DeliveryBoy.findOne({ userId: req.user.id });
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
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authenticated');
    }
    const allowedFields = ['name', 'email', 'phone', 'farmName', 'addressLine', 'village', 'city', 'state', 'herdSize', 'lat', 'lon'];
    const updates: Record<string, any> = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field] !== '') {
        updates[field] = field === 'herdSize' || field === 'lat' || field === 'lon'
          ? Number(req.body[field])
          : req.body[field];
      }
    });
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-passwordHash');
    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone } = req.body;
    const user = await User.findOne({ phone });

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
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, otp, password } = req.body;

    const user = await User.findOne({ 
      phone,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: new Date() } // Ensure OTP has not expired
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired OTP');
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);
    
    user.passwordHash = hashedPassword;
    
    // Clear OTP fields
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    
    // Also reset any failed login attempts/locks
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};
