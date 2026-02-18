import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Signup.css';

const Signup = () => {
    const [isCompanySignup, setIsCompanySignup] = useState(false);
    const [step, setStep] = useState(1); // 1: fill form + send OTP, 2: verify OTP
    const [otp, setOtp] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        // User fields
        age: '',
        gender: '',
        mobile: '',
        // Company fields
        phone: '',
        address: '',
        category: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, sendOTP, verifyOTP } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Step 1: Validate form and send OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        const result = await sendOTP({
            name: formData.name,
            email: formData.email,
            password: formData.password,
        });
        setLoading(false);

        if (result.success) {
            setStep(2);
            setSuccess(`OTP sent to ${formData.email}. Check your inbox!`);
        } else {
            setError(result.message);
        }
    };

    // Step 2: Verify OTP then register
    const handleVerifyAndSignup = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (otp.length !== 6) {
            setError('Please enter the 6-digit OTP');
            return;
        }

        setLoading(true);

        // First verify OTP
        const verifyResult = await verifyOTP(formData.email, otp);
        if (!verifyResult.success) {
            setError(verifyResult.message);
            setLoading(false);
            return;
        }

        setSuccess('OTP verified! Creating your account...');

        // Then register
        const role = isCompanySignup ? 'provider' : 'user';
        const registrationData = {
            name: formData.name,
            username: formData.username,
            email: formData.email,
            password: formData.password,
            role,
        };

        if (isCompanySignup) {
            if (formData.phone) registrationData.phone = formData.phone;
            if (formData.address) registrationData.address = formData.address;
            if (formData.category) registrationData.category = formData.category;
        } else {
            if (formData.age) registrationData.age = formData.age;
            if (formData.gender) registrationData.gender = formData.gender;
            if (formData.mobile) registrationData.mobile = formData.mobile;
        }

        const result = await register(registrationData);
        setLoading(false);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
    };

    const toggleSignupType = () => {
        setIsCompanySignup(!isCompanySignup);
        setError('');
        setSuccess('');
    };

    const handleBack = () => {
        setStep(1);
        setOtp('');
        setError('');
        setSuccess('');
    };

    return (
        <div className="signup-container">
            <div className={`signup-card ${isCompanySignup ? 'company-mode' : ''}`}>
                <div className="logo-container">
                    <div className="bee-logo">🐝</div>
                    <h1 className="brand-name">Service Bee</h1>
                    {isCompanySignup && (
                        <span className="company-badge">🏢 Company Registration</span>
                    )}
                </div>

                {/* Step indicator */}
                <div className="step-indicator">
                    <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
                    <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
                    <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
                </div>
                <p className="step-label">
                    {step === 1 ? 'Fill your details' : 'Verify your email'}
                </p>

                <h2 className="signup-title">
                    {step === 1
                        ? isCompanySignup ? 'Sign Up as Company' : 'Create Your Account'
                        : 'Enter OTP'}
                </h2>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                {/* STEP 1: Registration form */}
                {step === 1 && (
                    <form onSubmit={handleSendOTP} className="signup-form">
                        <div className="form-group">
                            <label htmlFor="name">
                                {isCompanySignup ? 'Company Name' : 'Full Name'}
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder={isCompanySignup ? 'Enter company name' : 'Enter your full name'}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Choose a unique username"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        {!isCompanySignup && (
                            <>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="age">Age</label>
                                        <input
                                            type="number"
                                            id="age"
                                            name="age"
                                            value={formData.age}
                                            onChange={handleChange}
                                            placeholder="Age"
                                            min="1"
                                            max="150"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="gender">Gender</label>
                                        <select
                                            id="gender"
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="mobile">Mobile Number</label>
                                    <input
                                        type="tel"
                                        id="mobile"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        placeholder="Enter mobile number"
                                    />
                                </div>
                            </>
                        )}

                        {isCompanySignup && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="phone">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Enter phone number"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="address">Address</label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Enter business address"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="category">Service Category</label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        <option value="cleaning">Cleaning Services</option>
                                        <option value="plumbing">Plumbing</option>
                                        <option value="electrical">Electrical</option>
                                        <option value="carpentry">Carpentry</option>
                                        <option value="painting">Painting</option>
                                        <option value="pest-control">Pest Control</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a password (min. 6 characters)"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-signup"
                            disabled={loading}
                        >
                            {loading ? 'Sending OTP...' : '📧 Send OTP'}
                        </button>

                        <div className="divider">
                            <span>or</span>
                        </div>

                        <button
                            type="button"
                            className="btn btn-toggle"
                            onClick={toggleSignupType}
                        >
                            {isCompanySignup ? 'Sign Up as User' : 'Sign Up as Company'}
                        </button>

                        <div className="divider"></div>

                        <div className="login-link">
                            Already have an account?{' '}
                            <a href="#" onClick={() => navigate('/')}>
                                Login
                            </a>
                        </div>
                    </form>
                )}

                {/* STEP 2: OTP verification */}
                {step === 2 && (
                    <form onSubmit={handleVerifyAndSignup} className="signup-form">
                        <div className="otp-info">
                            <p>We sent a 6-digit OTP to:</p>
                            <strong>{formData.email}</strong>
                        </div>

                        <div className="form-group">
                            <label htmlFor="otp">Enter OTP</label>
                            <input
                                type="text"
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="Enter 6-digit OTP"
                                maxLength={6}
                                className="otp-input"
                                required
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-signup"
                            disabled={loading || otp.length !== 6}
                        >
                            {loading ? 'Verifying...' : '✅ Verify & Sign Up'}
                        </button>

                        <button
                            type="button"
                            className="btn btn-back"
                            onClick={handleBack}
                            disabled={loading}
                        >
                            ← Back
                        </button>

                        <div className="resend-otp">
                            Didn't receive OTP?{' '}
                            <button
                                type="button"
                                className="resend-btn"
                                onClick={handleSendOTP}
                                disabled={loading}
                            >
                                Resend OTP
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Signup;
