import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

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

  try {
    const decoded = verifyToken(token) as { id: string; roles: string[] };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401);
    next(new Error('Not authorized, token failed'));
  }
};
