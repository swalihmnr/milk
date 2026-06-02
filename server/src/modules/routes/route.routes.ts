import express from 'express';
import { getRoutes, getRoute, createRoute, updateRoute, deleteRoute, assignDeliveryBoy, getDeliveryBoys } from './route.controller';
import { validate } from '../../middleware/validate.middleware';
import { createRouteSchema, updateRouteSchema } from './route.validation';
import { protect } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';

const router = express.Router();

router.use(protect);
router.use(authorize('farmer', 'admin'));

router.route('/')
  .get(getRoutes)
  .post(validate(createRouteSchema), createRoute);

router.get('/delivery-boys', getDeliveryBoys);

router.route('/:id')
  .get(getRoute)
  .put(validate(updateRouteSchema), updateRoute)
  .delete(deleteRoute);

router.patch('/:id/assign', assignDeliveryBoy);

export default router;

