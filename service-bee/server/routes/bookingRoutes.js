import express from 'express';
import { createBooking, getUserBookings, getProviderBookings, updateBookingStatus, cancelBooking, } from '../controllers/bookingController.js';
import { protect, providerOrAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/user', protect, getUserBookings);
router.get('/provider', protect, providerOrAdmin, getProviderBookings);
router.put('/:id/status', protect, providerOrAdmin, updateBookingStatus);
router.delete('/:id', protect, cancelBooking);

export default router;
