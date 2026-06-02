import { Request, Response, NextFunction } from 'express';
import { ZodError, z } from 'zod';

export const validate = (schema: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400);
        const zodErrors = (error as any).errors || (error as any).issues || [];
        return next(new Error(`Validation failed: ${zodErrors.map((e: any) => e.message).join(', ')}`));
      }
      next(error);
    }
  };
};
