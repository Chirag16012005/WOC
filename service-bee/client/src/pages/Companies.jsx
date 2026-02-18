import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Companies.css';

const Companies = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const response = await api.get('/companies');
            setCompanies(response.data.data);
        } catch (err) {
            setError('Failed to load companies');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileComplaint = (companyId, companyName) => {
        navigate('/complaint', { state: { companyId, companyName } });
    };

    const renderStars = (rating) => {
        const stars = [];
        const ratingNum = parseFloat(rating);
        for (let i = 0; i < 5; i++) {
            if (i < Math.floor(ratingNum)) {
                stars.push(<span key={i} className="star filled">★</span>);
            } else if (i < ratingNum) {
                stars.push(<span key={i} className="star half">★</span>);
            } else {
                stars.push(<span key={i} className="star">★</span>);
            }
        }
        return stars;
    };

    if (loading) {
        return (
            <div className="companies-container">
                <div className="loading">Loading companies...</div>
            </div>
        );
    }

    return (
        <div className="companies-container">
            <div className="companies-header">
                <div className="logo-section">
                    <div className="bee-logo">🐝</div>
                    <h1 className="brand-name">Service Bee</h1>
                </div>
                <h2 className="page-title">Available Services</h2>
                <p className="page-subtitle">Browse registered companies and file complaints</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            {companies.length === 0 ? (
                <div className="no-companies">
                    <p>No companies registered yet.</p>
                </div>
            ) : (
                <div className="companies-grid">
                    {companies.map((company) => (
                        <div key={company._id} className="company-card">
                            <div className="company-icon">🏢</div>
                            <h3 className="company-name">{company.name}</h3>
                            {company.category && (
                                <p className="company-category">📋 {company.category.charAt(0).toUpperCase() + company.category.slice(1).replace('-', ' ')}</p>
                            )}
                            <p className="company-email">📧 {company.email}</p>
                            {company.phone && (
                                <p className="company-phone">📞 {company.phone}</p>
                            )}
                            {company.address && (
                                <p className="company-address">📍 {company.address}</p>
                            )}

                            <div className="company-rating">
                                <div className="stars">
                                    {renderStars(company.averageRating || 0)}
                                </div>
                                <span className="rating-text">
                                    {company.averageRating || '0.0'} ({company.totalRatings || 0} ratings)
                                </span>
                            </div>

                            <button
                                className="btn btn-complaint"
                                onClick={() => handleFileComplaint(company._id, company.name)}
                            >
                                File Complaint
                            </button>
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
        </div>
    );
};

export default Companies;
