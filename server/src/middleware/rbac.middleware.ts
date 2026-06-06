import { Request, Response, NextFunction } from 'express';

const ROLE_EQUIVALENTS: Record<string, string[]> = {
  farmer: ['farmer', 'vendor'],
  vendor: ['farmer', 'vendor'],
  delivery: ['delivery', 'delivery_boy'],
  delivery_boy: ['delivery', 'delivery_boy'],
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.roles) {
      res.status(403);
      return next(new Error('Not authorized to access this route'));
    }

    const expandedRequiredRoles = roles.flatMap((role) => ROLE_EQUIVALENTS[role] || [role]);
    const hasRole = req.user.roles.some((role) => expandedRequiredRoles.includes(role));

    if (!hasRole) {
      res.status(403);
      return next(new Error(`User role is not authorized to access this route`));
    }

    next();
  };
};
