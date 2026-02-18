import asyncHandler from 'express-async-handler';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
    const { service, bookingDate, location, notes, totalPrice } = req.body;

    // Check if service exists
    const serviceExists = await Service.findById(service);

    if (!serviceExists) {
        res.status(404);
        throw new Error('Service not found');
    }

    const booking = await Booking.create({
        user: req.user._id,
        service,
        bookingDate,
        location,
        notes,
        totalPrice,
    });

    const populatedBooking = await Booking.findById(booking._id)
        .populate('service', 'name description price category')
        .populate('user', 'name email phone');

    res.status(201).json({
        success: true,
        data: populatedBooking,
    });
});

// @desc    Get user's bookings
// @route   GET /api/bookings/user
// @access  Private
const getUserBookings = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find({ user: req.user._id })
        .populate('service', 'name description price category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Booking.countDocuments({ user: req.user._id });

    res.json({
        success: true,
        data: bookings,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    });
});

// @desc    Get provider's bookings
// @route   GET /api/bookings/provider
// @access  Private (Provider/Admin)
const getProviderBookings = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find services by this provider
    const services = await Service.find({ provider: req.user._id });
    const serviceIds = services.map((s) => s._id);

    // Find bookings for those services
    const bookings = await Booking.find({ service: { $in: serviceIds } })
        .populate('service', 'name description price category')
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Booking.countDocuments({ service: { $in: serviceIds } });

    res.json({
        success: true,
        data: bookings,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    });
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Provider/Admin)
const updateBookingStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    // Check if user is the service provider or admin
    const service = await Service.findById(booking.service);

    if (service.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to update this booking');
    }

    booking.status = status;
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
        .populate('service', 'name description price category')
        .populate('user', 'name email phone');

    res.json({
        success: true,
        data: updatedBooking,
    });
});

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private
const cancelBooking = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    // Check if user owns the booking
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to cancel this booking');
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
        success: true,
        message: 'Booking cancelled successfully',
        data: booking,
    });
});

export { createBooking, getUserBookings, getProviderBookings, updateBookingStatus, cancelBooking };
