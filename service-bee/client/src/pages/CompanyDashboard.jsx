import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ChatBox from '../components/ChatBox';
import './CompanyDashboard.css';

const CompanyDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.role !== 'provider' && user.role !== 'admin') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const response = await api.get('/complaints/company-complaints');
            setComplaints(response.data.data);
        } catch (err) {
            setError('Failed to load complaints');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (complaintId, newStatus) => {
        try {
            await api.patch(`/complaints/${complaintId}/status`, { status: newStatus });
            fetchComplaints(); // Refresh list
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
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

    const renderStars = (rating) => {
        if (!rating) return <span className="no-rating">Not rated yet</span>;
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} className={`star ${i <= rating ? 'filled' : ''}`}>
                    ★
                </span>
            );
        }
        return stars;
    };

    const filteredComplaints = filter === 'all'
        ? complaints
        : complaints.filter(c => c.status === filter);

    if (loading) {
        return (
            <div className="company-dashboard-container">
                <div className="loading">Loading complaints...</div>
            </div>
        );
    }

    // Calculate company stats
    const resolvedComplaints = complaints.filter(c => c.status === 'resolved' && c.rating);
    const totalRating = resolvedComplaints.reduce((sum, c) => sum + (c.rating || 0), 0);
    const averageRating = resolvedComplaints.length > 0 ? (totalRating / resolvedComplaints.length).toFixed(1) : '0.0';

    return (
        <div className="company-dashboard-container">
            {/* Company Header */}
            <div className="company-header">
                <div className="header-top">
                    <button className="back-arrow" onClick={() => navigate('/dashboard')}>
                        ← Service Bee
                    </button>
                    <div className="header-actions">
                        <button className="header-btn">About Us</button>
                        <button className="header-btn" onClick={() => navigate('/company-settings')}>Settings</button>
                        <div className="user-profile">
                            <span className="user-avatar">👤</span>
                            <span className="user-name">{user?.name} ▼</span>
                        </div>
                    </div>
                </div>

                <div className="company-info-card">
                    <div className="company-icon">🏢</div>
                    <div className="company-details">
                        <h1 className="company-name">{user?.name}</h1>
                        <p className="company-description">
                            {user?.address || 'Professional service provider'}
                        </p>
                        <div className="company-meta">
                            <span><strong>Email:</strong> {user?.email}</span>
                            {user?.phone && <span><strong>Contact:</strong> {user?.phone}</span>}
                            {user?.address && <span><strong>City/Village:</strong> {user?.address}</span>}
                            <span className="company-rating">
                                <strong>Rating:</strong> ⭐ {averageRating} / 5
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Received Complaints Section */}
            <div className="complaints-section">
                <h2 className="section-title">Received Complaints</h2>

                {error && <div className="error-message">{error}</div>}

                {/* Filters */}
                <div className="filters">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All ({complaints.length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending ({complaints.filter(c => c.status === 'pending').length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'in-progress' ? 'active' : ''}`}
                        onClick={() => setFilter('in-progress')}
                    >
                        In Progress ({complaints.filter(c => c.status === 'in-progress').length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`}
                        onClick={() => setFilter('resolved')}
                    >
                        Resolved ({complaints.filter(c => c.status === 'resolved').length})
                    </button>
                </div>

                {filteredComplaints.length === 0 ? (
                    <div className="no-complaints">
                        <p>{filter === 'all' ? 'No complaints received yet.' : `No ${filter} complaints.`}</p>
                    </div>
                ) : (
                    <div className="complaints-list">
                        {filteredComplaints.map((complaint) => (
                            <div key={complaint._id} className="complaint-item">
                                <div className="complaint-content">
                                    <h3 className="complaint-title">{complaint.subject}</h3>
                                    <p className="complaint-from">
                                        <strong>From User:</strong> {complaint.user?.username || complaint.user?.name}
                                    </p>
                                    <p className="complaint-text">{complaint.description}</p>
                                    {complaint.user?.mobile && (
                                        <p className="complaint-contact">
                                            <strong>Contact:</strong> {complaint.user?.mobile}
                                        </p>
                                    )}
                                    {complaint.user?.email && (
                                        <p className="complaint-contact">
                                            <strong>Email:</strong> {complaint.user?.email}
                                        </p>
                                    )}
                                    <p className="complaint-date">
                                        Filed on: {new Date(complaint.createdAt).toLocaleDateString()}
                                    </p>

                                    {complaint.status === 'resolved' && complaint.rating && (
                                        <div className="complaint-rating">
                                            <strong>Customer Rating:</strong>
                                            <div className="stars-inline">
                                                {renderStars(complaint.rating)}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="complaint-actions">
                                    <select
                                        value={complaint.status}
                                        onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                                        className={`status-dropdown ${getStatusClass(complaint.status)}`}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                    </select>

                                    <button
                                        className="btn btn-chat"
                                        onClick={() => setSelectedComplaint(complaint)}
                                    >
                                        \ud83d\udcac Chat
                                        {complaint.unreadMessages?.company > 0 && (
                                            <span className="unread-badge">{complaint.unreadMessages.company}</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

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

export default CompanyDashboard;
