import express from 'express';
import { getMyWallet, topupWallet, configureAutoRecharge, payWithWallet } from './wallet.controller';
import { protect } from '../../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.get('/me', getMyWallet);
router.post('/topup', topupWallet);
router.post('/pay', payWithWallet);
router.post('/auto-recharge', configureAutoRecharge);

export default router;
