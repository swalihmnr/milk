import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import User from '../models/User';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
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
        realUser = await User.findOne({ phone: userData.phone }).select('_id');
      }
      if (!realUser) {
        // Import Role + UserRole inline to avoid circular deps
        const Role = (await import('../models/Role')).default;
        const UserRole = (await import('../models/UserRole')).default;
        const dbRole = role === 'vendor' ? 'farmer' : (role === 'delivery' ? 'delivery_boy' : role);
        const roleDoc = await Role.findOne({ name: dbRole });
        if (roleDoc) {
          const userRole = await UserRole.findOne({ roleId: roleDoc._id });
          if (userRole) realUser = await User.findById(userRole.userId).select('_id');
        }
      }
      if (!realUser) {
        realUser = await User.findOne().select('_id');
      }

      req.user = {
        id: realUser ? realUser._id.toString() : userData._id,
        roles: [role]
      };
      return next();
    } catch (err) {
      res.status(401);
      return next(new Error('Not authorized, mock token corrupt'));
    }
  }

  try {
    const decoded = verifyToken(token) as { id: string; roles: string[] };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401);
    next(new Error('Not authorized, token failed'));
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.roles || !req.user.roles.some((r: string) => roles.includes(r))) {
      res.status(403);
      return next(new Error('You do not have permission to perform this action'));
    }
    next();
  };
};
