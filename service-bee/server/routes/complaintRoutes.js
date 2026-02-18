import express from 'express';
import {
    createComplaint,
    getUserComplaints,
    getCompanyComplaints,
    updateComplaintStatus,
    rateComplaint,
    getAllComplaints,
} from '../controllers/complaintController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createComplaint);
router.get('/my-complaints', protect, getUserComplaints);
router.get('/company-complaints', protect, getCompanyComplaints);
router.get('/all', protect, getAllComplaints);
router.patch('/:id/status', protect, updateComplaintStatus);
router.post('/:id/rate', protect, rateComplaint);

export default router;
