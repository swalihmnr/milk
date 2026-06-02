import { Request, Response, NextFunction } from 'express';

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
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
