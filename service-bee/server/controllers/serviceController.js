import asyncHandler from 'express-async-handler';
import Service from '../models/Service.js';

// @desc    Create a new service
// @route   POST /api/services
// @access  Private (Provider/Admin)
const createService = asyncHandler(async (req, res) => {
    const { name, description, category, price, location, images } = req.body;

    const service = await Service.create({
        name,
        description,
        category,
        price,
        location,
        provider: req.user._id,
        images: images || [],
    });

    res.status(201).json({
        success: true,
        data: service,
    });
});

// @desc    Get all services with pagination, search, and filters
// @route   GET /api/services
// @access  Public
const getServices = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query object
    const query = { isActive: true };

    // Location-based filtering
    if (req.query.city) {
        query['location.city'] = new RegExp(req.query.city, 'i');
    }
    if (req.query.area) {
        query['location.area'] = new RegExp(req.query.area, 'i');
    }

    // Category filtering
    if (req.query.category) {
        query.category = req.query.category;
    }

    // Search by name or description
    if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i');
        query.$or = [
            { name: searchRegex },
            { description: searchRegex }
        ];
    }

    // Execute query with pagination
    const services = await Service.find(query)
        .populate('provider', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Service.countDocuments(query);

    res.json({
        success: true,
        data: services,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    });
});

// @desc    Get service by ID
// @route   GET /api/services/:id
// @access  Public
const getServiceById = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id).populate('provider', 'name email phone address');

    if (!service) {
        res.status(404);
        throw new Error('Service not found');
    }

    res.json({
        success: true,
        data: service,
    });
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Provider/Admin - own service only)
const updateService = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);

    if (!service) {
        res.status(404);
        throw new Error('Service not found');
    }

    // Check if user is the provider or an admin
    if (service.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to update this service');
    }

    const updatedService = await Service.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.json({
        success: true,
        data: updatedService,
    });
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Admin only)
const deleteService = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);

    if (!service) {
        res.status(404);
        throw new Error('Service not found');
    }

    await service.deleteOne();

    res.json({
        success: true,
        message: 'Service deleted successfully',
    });
});

export { createService, getServices, getServiceById, updateService, deleteService };
