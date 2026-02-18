import express from 'express';
import { getChatHistory, getChatRooms, markMessagesAsRead, getComplaintMessages, markComplaintMessagesAsRead } from '../controllers/chatController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/history/:roomId', protect, getChatHistory);
router.get('/rooms', protect, getChatRooms);
router.put('/read/:roomId', protect, markMessagesAsRead);

// Complaint-specific chat routes
router.get('/complaint/:complaintId', protect, getComplaintMessages);
router.post('/complaint/:complaintId/read', protect, markComplaintMessagesAsRead);

export default router;
