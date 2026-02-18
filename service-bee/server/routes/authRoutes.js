import express from 'express';
import { registerUser, loginUser, companyLogin, getMe, sendSignupOTP, verifySignupOTP } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/company-login', companyLogin);
router.post('/send-signup-otp', sendSignupOTP);
router.post('/verify-signup-otp', verifySignupOTP);
router.get('/me', protect, getMe);

export default router;
