import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// @desc    Get current company profile
// @route   GET /api/company/profile
// @access  Private (Company only)
export const getCompanyProfile = asyncHandler(async (req, res) => {
    const company = await User.findById(req.user._id).select('-password').lean();

    if (!company || company.role !== 'provider') {
        res.status(403);
        throw new Error('Access denied - Company accounts only');
    }

    res.json({
        success: true,
        data: company,
    });
});

// @desc    Update company profile (categories and location)
// @route   PUT /api/company/profile
// @access  Private (Company only)
export const updateCompanyProfile = asyncHandler(async (req, res) => {
    const { categories, location } = req.body;

    // Check if user is a company
    const company = await User.findById(req.user._id);

    if (!company || company.role !== 'provider') {
        res.status(403);
        throw new Error('Access denied - Company accounts only');
    }

    // Update categories if provided
    if (categories && Array.isArray(categories)) {
        company.categories = categories;
    }

    // Update location if provided
    if (location) {
        company.location = {
            city: location.city || company.location?.city || '',
            state: location.state || company.location?.state || '',
            area: location.area || company.location?.area || '',
        };
    }

    // Save updated company
    const updatedCompany = await company.save();

    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
            _id: updatedCompany._id,
            name: updatedCompany.name,
            email: updatedCompany.email,
            phone: updatedCompany.phone,
            categories: updatedCompany.categories,
            location: updatedCompany.location,
        },
    });
});
