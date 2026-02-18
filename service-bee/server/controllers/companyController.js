import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';

// @desc    Get all companies (providers)
// @route   GET /api/companies
// @access  Private
const getAllCompanies = asyncHandler(async (req, res) => {
    const { category, city, state, search } = req.query;

    // Build filter query — only providers, exclude the logged-in user (if they are a provider)
    const filter = { role: 'provider' };

    // Exclude the logged-in company from the list
    if (req.user && (req.user.role === 'provider' || req.user.role === 'admin')) {
        filter._id = { $ne: req.user._id };
    }

    // Filter by category if provided
    if (category) {
        filter.categories = category;
    }

    // Filter by city if provided
    if (city) {
        filter['location.city'] = new RegExp(city, 'i');
    }

    // Filter by state if provided
    if (state) {
        filter['location.state'] = new RegExp(state, 'i');
    }

    // Search by name
    if (search) {
        filter.name = new RegExp(search, 'i');
    }

    const companies = await User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .lean();

    // Calculate average rating for each company
    const companiesWithRatings = await Promise.all(
        companies.map(async (company) => {
            const complaints = await Complaint.find({
                company: company._id,
                status: 'resolved',
                rating: { $exists: true },
            }).lean();

            const totalRating = complaints.reduce((sum, c) => sum + (c.rating || 0), 0);
            const averageRating = complaints.length > 0 ? totalRating / complaints.length : 0;

            return {
                ...company,
                averageRating: averageRating.toFixed(1),
                totalRatings: complaints.length,
            };
        })
    );

    res.json({
        success: true,
        count: companiesWithRatings.length,
        data: companiesWithRatings,
        filters: { category, city, state }, // Send back applied filters
    });
});

// @desc    Get company details by ID
// @route   GET /api/companies/:id
// @access  Private
const getCompanyDetails = asyncHandler(async (req, res) => {
    const company = await User.findById(req.params.id).select('-password').lean();

    if (!company || company.role !== 'provider') {
        res.status(404);
        throw new Error('Company not found');
    }

    // Calculate average rating
    const complaints = await Complaint.find({
        company: company._id,
        status: 'resolved',
        rating: { $exists: true },
    }).lean();

    const totalRating = complaints.reduce((sum, c) => sum + (c.rating || 0), 0);
    const averageRating = complaints.length > 0 ? totalRating / complaints.length : 0;

    res.json({
        success: true,
        data: {
            ...company,
            averageRating: averageRating.toFixed(1),
            totalRatings: complaints.length,
        },
    });
});

export { getAllCompanies, getCompanyDetails };
