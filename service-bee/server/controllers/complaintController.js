import asyncHandler from 'express-async-handler';
import Complaint from '../models/Complaint.js';
import User from '../models/User.js';

// @desc    Create a new complaint against a company
// @route   POST /api/complaints
// @access  Private
const createComplaint = asyncHandler(async (req, res) => {
    const { companyId, subject, description, category } = req.body;

    // Validate required fields
    if (!companyId || !subject || !description) {
        res.status(400);
        throw new Error('Please provide company, subject and description');
    }

    // Verify company exists and is a provider
    const company = await User.findById(companyId);
    if (!company || company.role !== 'provider') {
        res.status(404);
        throw new Error('Company not found');
    }

    // Create complaint
    const complaint = await Complaint.create({
        user: req.user._id,
        company: companyId,
        subject:subject,
        description:description,
        category: category || 'other',
    });

    const populatedComplaint = await Complaint.findById(complaint._id)
        .populate('user', 'name email username')
        .populate('company', 'name email');

    res.status(201).json({
        success: true,
        data: populatedComplaint,
    });
});

// @desc    Get complaints filed by logged-in user
// @route   GET /api/complaints/my-complaints
// @access  Private
const getUserComplaints = asyncHandler(async (req, res) => {
    const complaints = await Complaint.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .populate('company', 'name email phone address');

    res.json({
        success: true,
        count: complaints.length,
        data: complaints,
    });
});

// @desc    Get complaints filed against logged-in company
// @route   GET /api/complaints/company-complaints
// @access  Private (Company only)
const getCompanyComplaints = asyncHandler(async (req, res) => {
    // Verify user is a company
    if (req.user.role !== 'provider' && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Access denied. Company accounts only.');
    }

    const complaints = await Complaint.find({ company: req.user._id })
        .sort({ createdAt: -1 })
        .populate('user', 'name email username mobile');

    res.json({
        success: true,
        count: complaints.length,
        data: complaints,
    });
});

// @desc    Update complaint status (company only)
// @route   PATCH /api/complaints/:id/status
// @access  Private (Company only)
const updateComplaintStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    if (!['pending', 'in-progress', 'resolved'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status value');
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
        res.status(404);
        throw new Error('Complaint not found');
    }

    // Verify the complaint is against this company
    if (complaint.company.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this complaint');
    }

    complaint.status = status;

    // Set resolvedAt timestamp if status is resolved
    if (status === 'resolved' && !complaint.resolvedAt) {
        complaint.resolvedAt = new Date();
    }

    await complaint.save();

    const updatedComplaint = await Complaint.findById(complaint._id)
        .populate('user', 'name email username')
        .populate('company', 'name email');

    res.json({
        success: true,
        data: updatedComplaint,
    });
});

// @desc    Rate a resolved complaint (user only)
// @route   POST /api/complaints/:id/rate
// @access  Private (User only)
const rateComplaint = asyncHandler(async (req, res) => {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        res.status(400);
        throw new Error('Please provide a rating between 1 and 5');
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
        res.status(404);
        throw new Error('Complaint not found');
    }

    // Verify the complaint belongs to this user
    if (complaint.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to rate this complaint');
    }

    // Verify complaint is resolved
    if (complaint.status !== 'resolved') {
        res.status(400);
        throw new Error('Can only rate resolved complaints');
    }

    // Check if already rated
    if (complaint.rating) {
        res.status(400);
        throw new Error('Complaint already rated');
    }

    complaint.rating = rating;
    complaint.ratedAt = new Date();
    await complaint.save();

    const updatedComplaint = await Complaint.findById(complaint._id)
        .populate('user', 'name email username')
        .populate('company', 'name email');

    res.json({
        success: true,
        data: updatedComplaint,
    });
});

// @desc    Get all complaints (admin only)
// @route   GET /api/complaints/all
// @access  Private/Admin
const getAllComplaints = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Access denied. Admin only.');
    }

    const complaints = await Complaint.find()
        .sort({ createdAt: -1 })
        .populate('user', 'name email username')
        .populate('company', 'name email');

    res.json({
        success: true,
        count: complaints.length,
        data: complaints,
    });
});

export {
    createComplaint,
    getUserComplaints,
    getCompanyComplaints,
    updateComplaintStatus,
    rateComplaint,
    getAllComplaints,
};
