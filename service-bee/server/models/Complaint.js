import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User reference is required'],
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Company reference is required'],
        },
        subject: {
            type: String,
            required: [true, 'Please add a subject'],
            trim: true,
            maxlength: [200, 'Subject cannot be more than 200 characters'],
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
            trim: true,
        },
        category: {
            type: String,
            enum: ['service', 'billing', 'technical', 'other'],
            default: 'other',
        },
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'resolved'],
            default: 'pending',
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        ratedAt: {
            type: Date,
        },
        resolvedAt: {
            type: Date,
        },
        unreadMessages: {
            user: {
                type: Number,
                default: 0,
            },
            company: {
                type: Number,
                default: 0,
            },
        },
    },
    {
        timestamps: true,
    }
);

// Virtual for chat room ID
complaintSchema.virtual('chatRoom').get(function () {
    return `complaint_${this._id}`;
});

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;
