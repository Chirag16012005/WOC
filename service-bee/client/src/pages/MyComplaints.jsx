import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ChatBox from '../components/ChatBox';
import './MyComplaints.css';

const MyComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [ratingComplaint, setRatingComplaint] = useState(null);
    const [rating, setRating] = useState(0);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const response = await api.get('/complaints/my-complaints');
            setComplaints(response.data.data);
        } catch (err) {
            setError('Failed to load complaints');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRateComplaint = async (complaintId) => {
        if (!rating || rating < 1 || rating > 5) {
            alert('Please select a rating between 1 and 5');
            return;
        }

        try {
            await api.post(`/complaints/${complaintId}/rate`, { rating });
            setRatingComplaint(null);
            setRating(0);
            fetchComplaints(); // Refresh list
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit rating');
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'pending': return 'status-pending';
            case 'in-progress': return 'status-progress';
            case 'resolved': return 'status-resolved';
            default: return '';
        }
    };

    const renderStars = (count, interactive = false, complaintId = null) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span
                    key={i}
                    className={`star ${i <= count ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
                    onClick={interactive ? () => setRating(i) : null}
                >
                    ★
                </span>
            );
        }
        return stars;
    };

    if (loading) {
        return (
            <div className="my-complaints-container">
                <div className="loading">Loading your complaints...</div>
            </div>
        );
    }

    return (
        <div className="my-complaints-container">
            <div className="header">
                <div className="logo-section">
                    <div className="bee-logo">🐝</div>
                    <h1 className="brand-name">Service Bee</h1>
                </div>
                <h2 className="page-title">My Complaints</h2>
                <p className="page-subtitle">Track and rate your filed complaints</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            {complaints.length === 0 ? (
                <div className="no-complaints">
                    <p>You haven't filed any complaints yet.</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/companies')}
                    >
                        Browse Services
                    </button>
                </div>
            ) : (
                <div className="complaints-list">
                    {complaints.map((complaint) => (
                        <div key={complaint._id} className="complaint-card">
                            <div className="complaint-header">
                                <h3 className="complaint-subject">{complaint.subject}</h3>
                                <span className={`status-badge ${getStatusClass(complaint.status)}`}>
                                    {complaint.status}
                                </span>
                            </div>

                            <div className="complaint-details">
                                <p><strong>Company:</strong> {complaint.company?.name}</p>
                                <p><strong>Category:</strong> {complaint.category}</p>
                                <p><strong>Filed on:</strong> {new Date(complaint.createdAt).toLocaleDateString()}</p>
                                {complaint.resolvedAt && (
                                    <p><strong>Resolved on:</strong> {new Date(complaint.resolvedAt).toLocaleDateString()}</p>
                                )}
                            </div>

                            <div className="complaint-description">
                                <p>{complaint.description}</p>
                            </div>

                            {complaint.status === 'resolved' && !complaint.rating && (
                                <div className="rating-section">
                                    {ratingComplaint === complaint._id ? (
                                        <div className="rating-input">
                                            <p>Rate this resolution:</p>
                                            <div className="stars">
                                                {renderStars(rating, true, complaint._id)}
                                            </div>
                                            <div className="rating-actions">
                                                <button
                                                    className="btn btn-submit-rating"
                                                    onClick={() => handleRateComplaint(complaint._id)}
                                                >
                                                    Submit Rating
                                                </button>
                                                <button
                                                    className="btn btn-cancel"
                                                    onClick={() => {
                                                        setRatingComplaint(null);
                                                        setRating(0);
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            className="btn btn-rate"
                                            onClick={() => setRatingComplaint(complaint._id)}
                                        >
                                            Rate Resolution
                                        </button>
                                    )}
                                </div>
                            )}

                            {complaint.rating && (
                                <div className="rating-display">
                                    <p><strong>Your Rating:</strong></p>
                                    <div className="stars">
                                        {renderStars(complaint.rating, false)}
                                    </div>
                                </div>
                            )}

                            {/* Chat Button */}
                            <div className="complaint-actions">
                                <button
                                    className="btn btn-chat"
                                    onClick={() => setSelectedComplaint(complaint)}
                                >
                                    💬 Chat with Company
                                    {complaint.unreadMessages?.user > 0 && (
                                        <span className="unread-badge">{complaint.unreadMessages.user}</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button
                className="btn btn-back"
                onClick={() => navigate('/dashboard')}
            >
                ← Back to Dashboard
            </button>

            {/* Chat Modal */}
            {selectedComplaint && (
                <ChatBox
                    complaint={selectedComplaint}
                    onClose={() => setSelectedComplaint(null)}
                />
            )}
        </div>
    );
};

export default MyComplaints;
