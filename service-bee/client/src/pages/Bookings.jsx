import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Bookings.css';

const Bookings = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await api.get('/bookings/user');
            setBookings(response.data.data);
            setError('');
        } catch (err) {
            setError('Failed to load bookings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;

        try {
            await api.delete(`/bookings/${bookingId}`);
            fetchBookings();
        } catch (err) {
            alert('Failed to cancel booking');
            console.error(err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return '#f39c12';
            case 'confirmed':
                return '#27ae60';
            case 'completed':
                return '#3498db';
            case 'cancelled':
                return '#e74c3c';
            default:
                return '#95a5a6';
        }
    };

    return (
        <div className="bookings-page">
            <nav className="navbar">
                <div className="navbar-brand">
                    <span className="bee-icon">🐝</span>
                    <h1>Service Bee</h1>
                </div>
                <div className="navbar-menu">
                    <span className="user-name">Welcome, {user?.name}</span>
                    <button onClick={() => navigate('/dashboard')} className="nav-btn">
                        Dashboard
                    </button>
                    <button onClick={logout} className="nav-btn logout">
                        Logout
                    </button>
                </div>
            </nav>

            <div className="bookings-content">
                <h2>My Bookings</h2>

                {error && <div className="error-banner">{error}</div>}

                {loading ? (
                    <div className="loading">Loading bookings...</div>
                ) : bookings.length > 0 ? (
                    <div className="bookings-list">
                        {bookings.map((booking) => (
                            <div key={booking._id} className="booking-card">
                                <div className="booking-header">
                                    <h3>{booking.service?.name || 'Service'}</h3>
                                    <span
                                        className="booking-status"
                                        style={{ backgroundColor: getStatusColor(booking.status) }}
                                    >
                                        {booking.status}
                                    </span>
                                </div>
                                <p className="booking-description">
                                    {booking.service?.description || 'No description'}
                                </p>
                                <div className="booking-details">
                                    <div className="detail-item">
                                        <strong>Date:</strong>{' '}
                                        {new Date(booking.bookingDate).toLocaleDateString()}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Location:</strong> {booking.location.address},{' '}
                                        {booking.location.city}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Price:</strong> ₹{booking.totalPrice}
                                    </div>
                                    {booking.notes && (
                                        <div className="detail-item">
                                            <strong>Notes:</strong> {booking.notes}
                                        </div>
                                    )}
                                </div>
                                {booking.status === 'pending' && (
                                    <button
                                        onClick={() => handleCancelBooking(booking._id)}
                                        className="cancel-btn"
                                    >
                                        Cancel Booking
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-bookings">
                        <p>You haven't made any bookings yet.</p>
                        <button onClick={() => navigate('/dashboard')} className="nav-btn">
                            Browse Services
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Bookings;
