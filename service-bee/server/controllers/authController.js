import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { sendOTPEmail } from './sendMail.js';

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, username, email, password, role, phone, age, gender, mobile, categories, location } = req.body;

    // Validate required fields
    if (!name || !username || !email || !password) {
        res.status(400);
        throw new Error('Please provide name, username, email, and password');
    }

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
        res.status(400);
        throw new Error(userExists.email === email ? 'Email already exists' : 'Username already exists');
    }

    const userData = {
        name, username, email, password, role: role || 'user',
    };

    // Add optional fields based on role
    if (role === 'provider') {
        // Company fields
        if (phone) userData.phone = phone;
        if (categories && Array.isArray(categories) && categories.length > 0) {
            userData.categories = categories;
        }
        if (location) {
            userData.location = {
                city: location.city || '',
                state: location.state || '',
                area: location.area || '',
            };
        }
    } else {
        // User fields
        if (age) userData.age = age;
        if (gender) userData.gender = gender;
        if (mobile) userData.mobile = mobile;
    }

    // Create user
    const user = await User.create(userData);

    if (user) {
        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                phone: user.phone,
                categories: user.categories,
                location: user.location,
                age: user.age,
                gender: user.gender,
                mobile: user.mobile,
                token: generateToken(user._id),
            },
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            },
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Company/Admin login
// @route   POST /api/auth/company-login
// @access  Public
const companyLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user with admin or provider role
    const user = await User.findOne({ email });

    if (!user) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    if (user.role !== 'admin' && user.role !== 'provider') {
        res.status(403);
        throw new Error('Access denied. This login is for companies only.');
    }

    if (await user.matchPassword(password)) {
        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            },
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');

    res.json({
        success: true,
        data: user,
    });
});

// @desc    Send OTP for signup email verification
// @route   POST /api/auth/send-signup-otp
// @access  Public
const sendSignupOTP = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('All fields are required');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        res.status(400);
        throw new Error('An account with this email already exists');
    }

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email });

    const otp = otpGenerator.generate(6, {
        digits: true,
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
    });

    await OTP.create({ email, otp });

    const emailResult = await sendOTPEmail(email, otp, name);

    if (emailResult.success) {
        res.status(200).json({
            success: true,
            message: 'OTP sent to your email',
            email,
        });
    } else {
        res.status(500);
        throw new Error('Failed to send OTP email. Please try again.');
    }
});

// @desc    Verify OTP for signup
// @route   POST /api/auth/verify-signup-otp
// @access  Public
const verifySignupOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        res.status(400);
        throw new Error('Email and OTP are required');
    }

    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
        res.status(400);
        throw new Error('Invalid or expired OTP. Please request a new one.');
    }

    await OTP.deleteMany({ email });

    res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
    });
});

export { registerUser, loginUser, companyLogin, getMe, sendSignupOTP, verifySignupOTP };
