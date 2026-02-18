import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        message: {
            type: String,
            required: [true, 'Message cannot be empty'],
            trim: true,
        },
        roomId: {
            type: String,
            required: true,
            index: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient chat history queries
messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
