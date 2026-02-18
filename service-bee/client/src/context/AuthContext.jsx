import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { initializeSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in on mount
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
            initializeSocket(token);
        }
        setLoading(false);
    }, []);

    const login = async (email, password, isCompanyLogin = false) => {
        try {
            const endpoint = isCompanyLogin ? '/auth/company-login' : '/auth/login';
            const response = await api.post(endpoint, { email, password });

            const { token, ...userData } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            // Initialize socket connection
            initializeSocket(token);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed',
            };
        }
    };

    const sendOTP = async (formData) => {
        try {
            await api.post('/auth/send-signup-otp', formData);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to send OTP',
            };
        }
    };

    const verifyOTP = async (email, otp) => {
        try {
            await api.post('/auth/verify-signup-otp', { email, otp });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Invalid OTP',
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);

            const { token, ...user } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);

            // Initialize socket connection
            initializeSocket(token);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed',
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        disconnectSocket();
        navigate('/');
    };

    const value = {
        user,
        loading,
        login,
        register,
        sendOTP,
        verifyOTP,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

