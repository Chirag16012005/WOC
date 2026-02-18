import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const [isCompanyLogin, setIsCompanyLogin] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password, isCompanyLogin);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    const handleCompanyLogin = () => {
        setIsCompanyLogin(true);
        setError('');
    };

    const handleUserLogin = () => {
        setIsCompanyLogin(false);
        setError('');
    };

    return (
        <div className={`login-container ${isCompanyLogin ? 'company-bg' : ''}`}>
            <div className={`login-card ${isCompanyLogin ? 'company-mode' : ''}`}>
                <div className="logo-container">
                    <div className="bee-logo">🐝</div>
                    <h1 className="brand-name">Service Bee</h1>
                    {isCompanyLogin && (
                        <span className="company-badge">🏢 Company Portal</span>
                    )}
                </div>

                <h2 className="login-title">
                    {isCompanyLogin ? 'Company Login' : 'Login to Your Account'}
                </h2>

                {isCompanyLogin && (
                    <div className="company-notice">
                        You are logging in as a <strong>Company / Provider</strong>
                    </div>
                )}

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">
                            {isCompanyLogin ? 'Company Email' : 'User ID or Email'}
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={isCompanyLogin ? 'Enter company email' : 'Enter your User ID or Email'}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={`btn ${isCompanyLogin ? 'btn-company-submit' : 'btn-login'}`}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : isCompanyLogin ? '🏢 Company Login' : 'Login'}
                    </button>

                    <div className="divider">
                        <span>or</span>
                    </div>

                    {!isCompanyLogin ? (
                        <button
                            type="button"
                            className="btn btn-company"
                            onClick={handleCompanyLogin}
                        >
                            🏢 Company Login
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="btn btn-back-user"
                            onClick={handleUserLogin}
                        >
                            ← Back to User Login
                        </button>
                    )}

                    <a href="#" className="forgot-password">
                        Forgot Password?
                    </a>

                    <div className="divider"></div>

                    <button
                        type="button"
                        className="btn btn-signup"
                        onClick={() => navigate('/register')}
                    >
                        Sign Up as user
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
