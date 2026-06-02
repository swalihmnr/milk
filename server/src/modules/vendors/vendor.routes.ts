import express from 'express';
import { getApprovedVendors } from './vendor.controller';

const router = express.Router();

router.get('/', getApprovedVendors);

export default router;
