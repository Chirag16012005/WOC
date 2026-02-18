import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
            required: true,
        },
        bookingDate: {
            type: Date,
            required: [true, 'Please add a booking date'],
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'completed', 'cancelled'],
            default: 'pending',
        },
        location: {
            address: {
                type: String,
                required: [true, 'Please add service location address'],
            },
            city: {
                type: String,
                required: true,
            },
            area: {
                type: String,
            },
        },
        notes: {
            type: String,
        },
        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient queries
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ service: 1, createdAt: -1 });
bookingSchema.index({ status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
