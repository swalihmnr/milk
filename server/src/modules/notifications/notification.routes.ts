import express from 'express';
import { getNotifications, markAsRead } from './notification.controller';
import { protect } from '../../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getNotifications);

router.route('/:id/read')
  .patch(markAsRead);

export default router;
