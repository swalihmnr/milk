import express from 'express';
import { getDeliveryBoys, registerDeliveryBoy, toggleDeliveryBoy, removeDeliveryBoy } from './deliveryboy.controller';
import { protect } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';

const router = express.Router();

router.use(protect);
router.use(authorize('farmer', 'admin'));

router.route('/')
  .get(getDeliveryBoys)
  .post(registerDeliveryBoy);

router.patch('/:id/toggle', toggleDeliveryBoy);
router.delete('/:id', removeDeliveryBoy);

export default router;
