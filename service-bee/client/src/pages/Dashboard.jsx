import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import api from '../services/api';
import Chat from '../components/Chat';
import './Dashboard.css';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const categories = ['cleaning', 'plumbing', 'electrical', 'carpentry', 'painting', 'pest-control', 'gardening', 'appliance-repair', 'other'];

    // Redirect providers/admins to their own dashboard immediately
    if (user && (user.role === 'provider' || user.role === 'admin')) {
        return <Navigate to="/company-dashboard" replace />;
    }

    useEffect(() => {
        fetchCompanies();
    }, [searchQuery, selectedCity, selectedCategory]);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();

            if (searchQuery) params.append('search', searchQuery);
            if (selectedCity) params.append('city', selectedCity);
            if (selectedCategory) params.append('category', selectedCategory);

            const response = await api.get(`/companies${params.toString() ? '?' + params.toString() : ''}`);
            setCompanies(response.data.data);
            setError('');
        } catch (err) {
            setError('Failed to load companies');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileComplaint = (company) => {
        navigate('/complaint', { state: { companyId: company._id, companyName: company.name } });
    };

    return (
        <div className="dashboard">
            <nav className="navbar">
                <div className="navbar-brand">
                    <span className="bee-icon">🐝</span>
                    <h1>Service Bee</h1>
                </div>
                <div className="navbar-menu">
                    <span className="user-name">Welcome, {user?.name}</span>
                    {user?.role === 'provider' || user?.role === 'admin' ? (
                        <button onClick={() => navigate('/company-dashboard')} className="nav-btn">
                            Complaints Dashboard
                        </button>
                    ) : (
                        <>
                            <button onClick={() => navigate('/companies')} className="nav-btn">
                                Browse Companies
                            </button>
                            <button onClick={() => navigate('/my-complaints')} className="nav-btn">
                                My Complaints
                            </button>
                        </>
                    )}
                    <button onClick={logout} className="nav-btn logout">
                        Logout
                    </button>
                </div>
            </nav>

            <div className="dashboard-content">
                <div className="filters-section">
                    <h2>Find Companies</h2>
                    <div className="filters">
                        <input
                            type="text"
                            placeholder="Search by company name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        <input
                            type="text"
                            placeholder="City"
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="filter-input"
                        />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                                </option>
                            ))}
                        </select>
                        <button onClick={() => {
                            setSearchQuery('');
                            setSelectedCity('');
                            setSelectedCategory('');
                        }} className="clear-btn">
                            Clear Filters
                        </button>
                    </div>
                </div>

                {error && <div className="error-banner">{error}</div>}

                {loading ? (
                    <div className="loading">Loading companies...</div>
                ) : (
                    <div className="services-grid">
                        {companies.length > 0 ? (
                            companies.map((company) => (
                                <div key={company._id} className="service-card">
                                    <div className="service-icon">🏢</div>
                                    <h3>{company.name}</h3>

                                    {/* Categories */}
                                    {company.categories && company.categories.length > 0 && (
                                        <div className="company-categories">
                                            {company.categories.map((cat, index) => (
                                                <span key={index} className="category-badge">
                                                    {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Location */}
                                    {company.location && (company.location.city || company.location.state) && (
                                        <p className="service-location">
                                            📍 {company.location.city}
                                            {company.location.state && `, ${company.location.state}`}
                                            {company.location.area && ` (${company.location.area})`}
                                        </p>
                                    )}

                                    {/* Contact */}
                                    {company.phone && (
                                        <p className="company-phone">📞 {company.phone}</p>
                                    )}
                                    <p className="company-email">📧 {company.email}</p>

                                    {/* Rating */}
                                    {company.averageRating > 0 && (
                                        <div className="company-rating">
                                            ⭐ {company.averageRating} ({company.totalRatings} ratings)
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleFileComplaint(company)}
                                        className="book-btn"
                                    >
                                        File Complaint
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="no-services">No companies found</div>
                        )}
                    </div>
                )}
            </div>

            <Chat />
        </div>
    );
};

export default Dashboard;
