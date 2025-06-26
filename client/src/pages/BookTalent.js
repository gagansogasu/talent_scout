import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './BookTalent.css';

const BookTalent = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const [talent, setTalent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        projectTitle: '',
        description: '',
        startDate: '',
        endDate: '',
        budget: '',
        requirements: '',
    });

    const fetchTalentProfile = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token not found. Please log in.');
                setLoading(false);
                return;
            }
            console.log(`Attempting to fetch talent profile for ID: ${id} using first endpoint`);
            // First try to get the talent profile by ID directly
            const response = await axios.get(`http://localhost:5000/api/talent/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.data) {
                console.log('Talent profile fetched successfully from first endpoint:', response.data);
                setTalent(response.data);
            } else {
                console.log('No data found for talent ID directly, trying with user ID approach...');
                // If not found, try the user ID approach
                const profileResponse = await axios.get(`http://localhost:5000/api/talent/profile/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                console.log('Talent profile fetched (via user ID) successfully from second endpoint:', profileResponse.data);
                setTalent(profileResponse.data);
            }
        } catch (error) {
            console.error('Error fetching talent profile:', error.response?.data || error.message);
            if (error.response?.status === 404) {
                setError('Talent profile not found. The talent may have been removed or the link is invalid.');
            } else if (error.response?.status === 401) {
                setError('Unauthorized: Please log in to view talent profiles.');
                navigate('/login');
            } else {
                setError(`Failed to fetch talent profile: ${error.response?.data?.message || error.message}. Please try again later.`);
            }
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        console.log('BookTalent page loaded. Talent ID from URL params:', id);
        fetchTalentProfile();
    }, [id, fetchTalentProfile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        if (!user || user.role !== 'recruiter') {
            setError('Only recruiters can create booking requests.');
            setSubmitting(false);
            return;
        }

        try {
            // Format projectDate and message to match backend schema
            const formattedProjectDate = formData.startDate && formData.endDate
                ? `${formData.startDate} to ${formData.endDate}`
                : 'To be discussed';

            const combinedMessage = `Project Title: ${formData.projectTitle}\nDescription: ${formData.description}\nRequirements: ${formData.requirements}`;

            // Calculate duration (simple example, you might want more complex logic)
            let duration = 0; // Initialize duration as a number
            if (formData.startDate && formData.endDate) {
                const start = new Date(formData.startDate);
                const end = new Date(formData.endDate);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                duration = diffDays; // Assign numerical value
            }

            console.log('Submitting booking request with data:', {
                talentId: talent.user._id,
                recruiterId: user._id,
                projectTitle: formData.projectTitle,
                description: formData.description,
                startDate: formData.startDate,
                endDate: formData.endDate,
                budget: formData.budget,
                requirements: formData.requirements,
                projectDate: formData.startDate,
                duration: duration,
                message: combinedMessage,
            });

            const response = await axios.post('http://localhost:5000/api/booking/request', {
                talentId: talent.user._id,
                recruiterId: user._id,
                projectTitle: formData.projectTitle,
                description: formData.description,
                startDate: formData.startDate,
                endDate: formData.endDate,
                budget: formData.budget,
                requirements: formData.requirements,
                projectDate: formData.startDate,
                duration: duration,
                message: combinedMessage,
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

            console.log('Booking request submitted successfully:', response.data);
            alert('Booking request sent successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error submitting booking request:', error.response?.data || error.message);
            setError(error.response?.data?.message || 'Failed to submit booking request.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="centered-container">
                <div className="centered-content">
                    <div className="loading-spinner"></div>
                    <p className="message-text">Loading talent profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="centered-container">
                <div className="centered-content">
                    <p className="error-message">{error}</p>
                    <button onClick={() => navigate(-1)} className="submit-button" style={{ maxWidth: '200px', margin: '1rem auto' }}>Go Back</button>
                </div>
            </div>
        );
    }

    if (!talent) {
        return (
            <div className="centered-container">
                <div className="centered-content">
                    <p className="error-message">Talent profile not found.</p>
                    <button onClick={() => navigate(-1)} className="submit-button" style={{ maxWidth: '200px', margin: '1rem auto' }}>Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="book-talent-container">
            <div className="card-wrapper">
                <div className="card">
                    <div className="header">
                        <h1 className="title">Book {talent.name}</h1>
                        <p className="subtitle">Professional Talent Booking Request</p>
                    </div>
                    <div className="content-padding">
                        {error && <div className="error-message">{error}</div>}

                        <h2 className="section-title">Talent Summary</h2>
                        <div className="grid">
                            <div>
                                <p className="detail-label">Hourly Rate</p>
                                <p className="detail-value">${talent.hourlyRate}/hr</p>
                            </div>
                            <div>
                                <p className="detail-label">Location</p>
                                <p className="detail-value">{talent.location}</p>
                            </div>
                            <div>
                                <p className="detail-label">Availability</p>
                                <p className="detail-value">{talent.availability}</p>
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem' }}>
                            <p className="detail-label">Skills</p>
                            <p className="detail-value">{talent.skills?.join(', ') || 'N/A'}</p>
                        </div>

                        <h2 className="section-title" style={{ marginTop: '2rem' }}>Project Details</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="projectTitle" className="label">Project Title</label>
                                <input
                                    type="text"
                                    id="projectTitle"
                                    name="projectTitle"
                                    value={formData.projectTitle}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description" className="label">Project Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    className="textarea"
                                    required
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label htmlFor="requirements" className="label">Specific Requirements</label>
                                <textarea
                                    id="requirements"
                                    name="requirements"
                                    value={formData.requirements}
                                    onChange={handleChange}
                                    rows="3"
                                    className="textarea"
                                ></textarea>
                            </div>

                            <div className="grid">
                                <div className="form-group">
                                    <label htmlFor="startDate" className="label">Start Date</label>
                                    <input
                                        type="date"
                                        id="startDate"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="input"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="endDate" className="label">End Date</label>
                                    <input
                                        type="date"
                                        id="endDate"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        className="input"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="budget" className="label">Budget (USD)</label>
                                <input
                                    type="number"
                                    id="budget"
                                    name="budget"
                                    value={formData.budget}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                    min="0"
                                />
                            </div>

                            <button type="submit" className="submit-button">
                                Submit Booking Request
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookTalent;