import express from 'express';
import { getAllCompanies, getCompanyDetails } from '../controllers/companyController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllCompanies);
router.get('/:id', protect, getCompanyDetails);

export default router;
