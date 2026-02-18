import asyncHandler from 'express-async-handler';
import Message from '../models/Message.js';

// @desc    Get chat history for a room
// @route   GET /api/chat/history/:roomId
// @access  Private
const getChatHistory = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ roomId })
        .populate('sender', 'name email role')
        .populate('receiver', 'name email role')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit);

    const total = await Message.countDocuments({ roomId });

    res.json({
        success: true,
        data: messages,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    });
});

// @desc    Get user's chat rooms
// @route   GET /api/chat/rooms
// @access  Private
const getChatRooms = asyncHandler(async (req, res) => {
    // Find all unique rooms where user is either sender or receiver
    const messages = await Message.find({
        $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
        .populate('sender', 'name email role')
        .populate('receiver', 'name email role')
        .sort({ createdAt: -1 });

    // Get unique room IDs with last message
    const roomMap = new Map();
    messages.forEach((msg) => {
        if (!roomMap.has(msg.roomId)) {
            roomMap.set(msg.roomId, {
                roomId: msg.roomId,
                lastMessage: msg.message,
                lastMessageTime: msg.createdAt,
                otherUser:
                    msg.sender._id.toString() === req.user._id.toString()
                        ? msg.receiver
                        : msg.sender,
            });
        }
    });

    const rooms = Array.from(roomMap.values());

    res.json({
        success: true,
        data: rooms,
    });
});

// @desc    Mark messages as read
// @route   PUT /api/chat/read/:roomId
// @access  Private
const markMessagesAsRead = asyncHandler(async (req, res) => {
    const { roomId } = req.params;

    await Message.updateMany(
        { roomId, receiver: req.user._id, isRead: false },
        { isRead: true }
    );

    res.json({
        success: true,
        message: 'Messages marked as read',
    });
});

// @desc    Get all messages for a specific complaint
// @route   GET /api/chat/complaint/:complaintId
// @access  Private
const getComplaintMessages = asyncHandler(async (req, res) => {
    const { complaintId } = req.params;

    // Verify complaint exists and user has access
    const Complaint = (await import('../models/Complaint.js')).default;
    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
        res.status(404);
        throw new Error('Complaint not found');
    }

    // Check if user is either the complaint creator or the company
    if (
        complaint.user.toString() !== req.user._id.toString() &&
        complaint.company.toString() !== req.user._id.toString()
    ) {
        res.status(403);
        throw new Error('Not authorized to view this chat');
    }

    // Get all messages for this complaint's chat room
    const roomId = `complaint_${complaintId}`;
    const messages = await Message.find({ roomId })
        .populate('sender', 'name role')
        .populate('receiver', 'name role')
        .sort({ createdAt: 1 });

    res.json({
        success: true,
        data: messages,
    });
});

// @desc    Mark complaint chat messages as read
// @route   POST /api/chat/complaint/:complaintId/read
// @access  Private
const markComplaintMessagesAsRead = asyncHandler(async (req, res) => {
    const { complaintId } = req.params;

    const Complaint = (await import('../models/Complaint.js')).default;
    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
        res.status(404);
        throw new Error('Complaint not found');
    }

    // Check if user has access
    if (
        complaint.user.toString() !== req.user._id.toString() &&
        complaint.company.toString() !== req.user._id.toString()
    ) {
        res.status(403);
        throw new Error('Not authorized');
    }

    // Determine which field to reset based on user role
    if (complaint.user.toString() === req.user._id.toString()) {
        // User is reading, reset user's unread count
        complaint.unreadMessages.user = 0;
    } else {
        // Company is reading, reset company's unread count
        complaint.unreadMessages.company = 0;
    }

    await complaint.save();

    res.json({
        success: true,
        message: 'Messages marked as read',
    });
});

export { getChatHistory, getChatRooms, markMessagesAsRead, getComplaintMessages, markComplaintMessagesAsRead };
