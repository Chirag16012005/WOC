import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Complaint.css';

const Complaint = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const { companyId, companyName } = location.state || {};

    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        category: 'other',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect if no company selected
    if (!companyId) {
        return (
            <div className="complaint-container">
                <div className="complaint-card">
                    <h2>No Company Selected</h2>
                    <p>Please select a company from the services page to file a complaint.</p>
                    <button
                        className="btn btn-back"
                        onClick={() => navigate('/companies')}
                    >
                        Go to Services
                    </button>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.subject || !formData.description) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/complaints', {
                companyId,
                subject: formData.subject,
                description: formData.description,
                category: formData.category,
            });

            if (response.data.success) {
                setSuccess('Complaint filed successfully! You can track it in "My Complaints".');
                setFormData({
                    subject: '',
                    description: '',
                    category: 'other',
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit complaint');
        }

        setLoading(false);
    };

    return (
        <div className="complaint-container">
            <div className="complaint-card">
                <div className="logo-container">
                    <div className="bee-logo">🐝</div>
                    <h1 className="brand-name">Service Bee</h1>
                </div>

                <h2 className="complaint-title">File a Complaint</h2>

                <div className="company-info">
                    <p><strong>Company:</strong> {companyName}</p>
                </div>

                <div className="user-info">
                    <p><strong>Your Name:</strong> {user?.name}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Username:</strong> {user?.username}</p>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit} className="complaint-form">
                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="service">Service Issue</option>
                            <option value="billing">Billing</option>
                            <option value="technical">Technical Problem</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="subject">Subject</label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="Brief description of the issue"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Please provide detailed information about your complaint"
                            rows="6"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-submit"
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : 'Submit Complaint'}
                    </button>

                    <div className="divider"></div>

                    <button
                        type="button"
                        className="btn btn-back"
                        onClick={() => navigate('/companies')}
                    >
                        Back to Services
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Complaint;
