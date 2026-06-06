"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400);
                const zodErrors = error.errors || error.issues || [];
                return next(new Error(`Validation failed: ${zodErrors.map((e) => e.message).join(', ')}`));
            }
            next(error);
        }
    };
};
exports.validate = validate;
