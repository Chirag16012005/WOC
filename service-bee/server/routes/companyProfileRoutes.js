import express from 'express';
import { getCompanyProfile, updateCompanyProfile } from '../controllers/companyProfileController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protected routes - company only
router.get('/profile', protect, getCompanyProfile);
router.put('/profile', protect, updateCompanyProfile);

export default router;
