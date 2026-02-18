import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './CompanySettings.css';

const CompanySettings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        categories: [],
        location: {
            city: '',
            state: '',
            area: '',
        },
    });

    const availableCategories = [
        { value: 'cleaning', label: 'Cleaning Services' },
        { value: 'plumbing', label: 'Plumbing' },
        { value: 'electrical', label: 'Electrical' },
        { value: 'carpentry', label: 'Carpentry' },
        { value: 'painting', label: 'Painting' },
        { value: 'pest-control', label: 'Pest Control' },
        { value: 'gardening', label: 'Gardening' },
        { value: 'appliance-repair', label: 'Appliance Repair' },
        { value: 'other', label: 'Other' },
    ];

    useEffect(() => {
        if (user?.role !== 'provider' && user?.role !== 'admin') {
            navigate('/dashboard');
            return;
        }
        fetchProfile();
    }, [user, navigate]);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/company/profile');
            const profileData = response.data.data;

            setFormData({
                categories: profileData.categories || [],
                location: {
                    city: profileData.location?.city || '',
                    state: profileData.location?.state || '',
                    area: profileData.location?.area || '',
                },
            });
        } catch (err) {
            setError('Failed to load profile');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryToggle = (category) => {
        setFormData((prev) => ({
            ...prev,
            categories: prev.categories.includes(category)
                ? prev.categories.filter((c) => c !== category)
                : [...prev.categories, category],
        }));
    };

    const handleLocationChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            location: {
                ...prev.location,
                [name]: value,
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.categories.length === 0) {
            setError('Please select at least one category');
            return;
        }

        setSaving(true);
        try {
            await api.put('/company/profile', formData);
            setSuccess('Profile updated successfully!');
            setTimeout(() => {
                navigate('/company-dashboard');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="settings-container">
                <div className="loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="settings-container">
            <div className="settings-header">
                <button className="back-btn" onClick={() => navigate('/company-dashboard')}>
                    ← Back to Dashboard
                </button>
                <h1>Company Settings</h1>
                <p className="header-subtitle">Update your service categories and location</p>
            </div>

            <div className="settings-content">
                <form onSubmit={handleSubmit} className="settings-form">
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <div className="form-section">
                        <h2>Service Categories</h2>
                        <p className="section-desc">Select all categories that apply to your business</p>
                        <div className="categories-grid">
                            {availableCategories.map((cat) => (
                                <label key={cat.value} className="category-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={formData.categories.includes(cat.value)}
                                        onChange={() => handleCategoryToggle(cat.value)}
                                    />
                                    <span className="checkbox-label">{cat.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-section">
                        <h2>Business Location</h2>
                        <p className="section-desc">Provide your business location details</p>
                        <div className="location-fields">
                            <div className="form-group">
                                <label htmlFor="city">City</label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={formData.location.city}
                                    onChange={handleLocationChange}
                                    placeholder="e.g., Mumbai"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="state">State</label>
                                <input
                                    type="text"
                                    id="state"
                                    name="state"
                                    value={formData.location.state}
                                    onChange={handleLocationChange}
                                    placeholder="e.g., Maharashtra"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="area">Area/Locality</label>
                                <input
                                    type="text"
                                    id="area"
                                    name="area"
                                    value={formData.location.area}
                                    onChange={handleLocationChange}
                                    placeholder="e.g., Andheri West"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => navigate('/company-dashboard')}
                            className="btn btn-cancel"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn btn-save"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompanySettings;
