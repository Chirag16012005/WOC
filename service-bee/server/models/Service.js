import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a service name'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
        },
        category: {
            type: String,
            required: [true, 'Please add a category'],
            enum: ['home', 'repair', 'cleaning', 'plumbing', 'electrical', 'painting', 'carpentry', 'other'],
        },
        price: {
            type: Number,
            required: [true, 'Please add a price'],
            min: 0,
        },
        location: {
            city: {
                type: String,
                required: [true, 'Please add a city'],
            },
            area: {
                type: String,
                required: [true, 'Please add an area'],
            },
        },
        provider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        images: [
            {
                type: String,
            },
        ],
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        numReviews: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for location-based searches
serviceSchema.index({ 'location.city': 1, 'location.area': 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ name: 'text', description: 'text' });

const Service = mongoose.model('Service', serviceSchema);

export default Service;
