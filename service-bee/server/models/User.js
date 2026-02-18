import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
            trim: true,
        },
        username: {
            type: String,
            required: [true, 'Please add a username'],
            unique: true,
            trim: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
            minlength: 6,
        },
        role: {
            type: String,
            enum: ['user', 'provider', 'admin'],
            default: 'user',
        },
        phone: {
            type: String,
        },
        // Company-specific fields
        categories: [{
            type: String,
            enum: ['cleaning', 'plumbing', 'electrical', 'carpentry', 'painting', 'pest-control', 'gardening', 'appliance-repair', 'other'],
        }],
        location: {
            city: {
                type: String,
            },
            state: {
                type: String,
            },
            area: {
                type: String,
            },
        },
        // Deprecated fields (keep for backward compatibility)
        address: {
            type: String,
        },
        category: {
            type: String,
        },
        // User-specific fields
        age: {
            type: Number,
            min: 1,
            max: 150,
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
        },
        mobile: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
