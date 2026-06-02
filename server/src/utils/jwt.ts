import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Response } from 'express';

export const generateToken = (userId: string, roleNames: string[]) => {
  return jwt.sign({ id: userId, roles: roleNames }, env.JWT_SECRET as string, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
};

export const setTokenCookie = (res: Response, token: string) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, env.JWT_SECRET);
};
