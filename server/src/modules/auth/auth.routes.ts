import express from 'express';
import { signup, login, logout, getMe, forgotPassword, resetPassword, updateProfile } from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.validation';
import { protect } from '../../middleware/auth.middleware';

const router = express.Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

export default router;
