// ExploreTalent.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSearch, FaStar, FaRegStar, FaBriefcase, FaMapMarkerAlt, FaMoneyBillWave, FaUserTie, FaLaptopCode, FaHome, FaTheaterMasks, FaImage, FaVideo, FaLink } from 'react-icons/fa';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import './ExploreTalent.css';

const categories = [
    { id: 'Professional', name: 'Professional', icon: <FaUserTie className="category-icon" /> },
    { id: 'Creative', name: 'Creative', icon: <FaTheaterMasks className="category-icon" /> },
    { id: 'Technical', name: 'Technical', icon: <FaLaptopCode className="category-icon" /> },
    { id: 'Household', name: 'Household', icon: <FaHome className="category-icon" /> },
    { id: 'Showbizz', name: 'Showbizz', icon: <FaTheaterMasks className="category-icon" /> }
];

// Helper function to calculate cosine similarity between search query and talent's content
const calculateSimilarity = (query, talent) => {
    if (!query) return 0;

    // Combine relevant fields for similarity calculation
    const content = [
        talent.bio || '',
        talent.skills?.join(' ') || '',
        talent.category || '',
        talent.experience || '',
        talent.resumeText || ''
    ].join(' ').toLowerCase();

    const queryTerms = query.toLowerCase().split(/\s+/);
    const contentTerms = content.split(/\s+/);

    // Calculate term frequencies
    const queryTf = {};
    const contentTf = {};

    queryTerms.forEach(term => {
        queryTf[term] = (queryTf[term] || 0) + 1;
    });

    contentTerms.forEach(term => {
        contentTf[term] = (contentTf[term] || 0) + 1;
    });

    // Calculate dot product
    let dotProduct = 0;
    for (const term in queryTf) {
        if (contentTf[term]) {
            dotProduct += queryTf[term] * contentTf[term];
        }
    }

    // Calculate magnitudes
    const queryMagnitude = Math.sqrt(
        Object.values(queryTf).reduce((sum, val) => sum + val * val, 0)
    );

    const contentMagnitude = Math.sqrt(
        Object.values(contentTf).reduce((sum, val) => sum + val * val, 0)
    );

    // Avoid division by zero
    if (queryMagnitude === 0 || contentMagnitude === 0) return 0;

    return dotProduct / (queryMagnitude * contentMagnitude);
};

// Helper function for searching and ranking talents
const searchTalentsHelper = (allTalents, query, category, availability) => {
    let currentFiltered = allTalents;

    if (category && category !== 'all') {
        currentFiltered = currentFiltered.filter(t => t.category === category);
    }

    if (availability && availability !== 'all') {
        currentFiltered = currentFiltered.filter(t => t.availability === availability);
    }

    if (query) {
        const rankedProfiles = currentFiltered.map(profile => {
            const similarity = calculateSimilarity(query.toLowerCase(), profile);
            return { ...profile.toObject(), similarity };
        });
        return rankedProfiles.sort((a, b) => b.similarity - a.similarity);
    }

    return currentFiltered;
};

const ExploreTalent = () => {
    const [talents, setTalents] = useState([]);
    const [filteredTalents, setFilteredTalents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('Professional');
    const [showTalentDetails, setShowTalentDetails] = useState(null);
    const [likedTalents, setLikedTalents] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [workSamples, setWorkSamples] = useState({});
    const [availabilityFilter, setAvailabilityFilter] = useState('all');
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchTalents = useCallback(async () => {
        const query = searchParams.get('query') || '';
        const category = searchParams.get('category') || selectedCategory;
        const availability = searchParams.get('availability') || availabilityFilter;

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');

            // Fetch talents with all filters
            const [talentsResponse, likesResponse] = await Promise.all([
                axios.get(`http://localhost:5000/api/talent/search`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    params: {
                        q: query,
                        category,
                        availability
                    },
                    withCredentials: true
                }),
                axios.get(`http://localhost:5000/api/talent/likes`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).catch(() => ({ data: { likedTalents: [] } }))
            ]);

            if (Array.isArray(talentsResponse.data)) {
                if (likesResponse?.data?.likedTalents) {
                    setLikedTalents(new Set(likesResponse.data.likedTalents));
                }

                setTalents(talentsResponse.data);

                // Fetch work samples (still dependent on filtered list, will adjust later if needed)
                // For now, fetch work samples for ALL fetched talents, then filter them
                const samples = {};
                for (const talent of talentsResponse.data) { // Fetch for all talents initially
                    try {
                        const workResponse = await axios.get(`/api/work-samples/${talent._id}`);
                        samples[talent._id] = workResponse.data;
                    } catch (err) {
                        console.error(`Error fetching work samples for talent ${talent._id}:`, err);
                        samples[talent._id] = [];
                    }
                }
                setWorkSamples(samples);
            } else {
                toast.error('Unexpected response format from server');
                setTalents([]);
                setFilteredTalents([]);
            }
        } catch (err) {
            let errorMessage = 'Failed to load talents.';
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
            toast.error(errorMessage);
            setTalents([]);
            setFilteredTalents([]);
        } finally {
            setLoading(false);
        }
    }, [searchParams, selectedCategory, availabilityFilter]);

    // New useEffect to apply filtering and ranking whenever talents or filter criteria change
    useEffect(() => {
        setFilteredTalents(searchTalentsHelper(talents, searchQuery, selectedCategory, availabilityFilter));
    }, [talents, searchQuery, selectedCategory, availabilityFilter]);

    // Enhanced handleSearch function
    const handleSearch = (e) => {
        e.preventDefault();
        const searchTerm = e.target.search.value;
        setSearchQuery(searchTerm);

        // Update URL params
        const params = new URLSearchParams(searchParams);
        params.set('query', searchTerm);
        params.set('category', selectedCategory);
        params.set('availability', availabilityFilter);
        setSearchParams(params);

        // No direct call to setFilteredTalents here, the useEffect will handle it
    };

    // Handle availability filter change
    const handleAvailabilityChange = (availability) => {
        setAvailabilityFilter(availability);

        // Update URL params
        const params = new URLSearchParams(searchParams);
        params.set('availability', availability);
        setSearchParams(params);

        // No direct call to setFilteredTalents here, the useEffect will handle it
    };

    // Fetch work samples for a talent
    const fetchWorkSamples = useCallback(async (talentId) => {
        try {
            const response = await axios.get(`/api/work-samples/${talentId}`);
            setWorkSamples(prev => ({
                ...prev,
                [talentId]: response.data
            }));
        } catch (error) {
            console.error('Error fetching work samples:', error);
        }
    }, []);

    // Handle like/unlike talent
    const handleLikeTalent = async (talentId, e) => {
        e.stopPropagation();

        if (!user) {
            toast.info('Please log in to like talents');
            navigate('/login');
            return;
        }

        try {
            const isLiked = likedTalents.has(talentId);

            if (isLiked) {
                await axios.delete(`/api/talent/${talentId}/like`);
                setLikedTalents(prev => {
                    const newLiked = new Set(prev);
                    newLiked.delete(talentId);
                    return newLiked;
                });
                toast.success('Removed from your liked talents');
            } else {
                await axios.post(`/api/talent/${talentId}/like`);
                setLikedTalents(prev => new Set([...prev, talentId]));
                toast.success('Added to your liked talents');
            }

            // Update the talent's like count in the UI
            setTalents(prev =>
                prev.map(talent =>
                    talent._id === talentId
                        ? { ...talent, likes: isLiked ? talent.likes - 1 : (talent.likes || 0) + 1 }
                        : talent
                )
            );

            setFilteredTalents(prev =>
                prev.map(talent =>
                    talent._id === talentId
                        ? { ...talent, likes: isLiked ? talent.likes - 1 : (talent.likes || 0) + 1 }
                        : talent
                )
            );
        } catch (err) {
            console.error('Error toggling like:', err);
            toast.error('Failed to update like status');
        }
    };

    // Handle view talent details
    const handleViewDetails = (talent) => {
        setShowTalentDetails(talent);
    };

    // Handle book talent
    const handleBookTalent = (talent) => {
        // Ensure we pass the talent profile's _id, not the user's ID
        const talentProfileId = talent._id;
        if (!talentProfileId) {
            toast.error('Invalid talent information: Missing profile ID');
            return;
        }
        navigate(`/book-talent/${talentProfileId}`, { state: { talent } });
    };

    // Handle category selection
    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setSearchQuery('');
        setSearchParams({ category });
        // No direct call to setFilteredTalents here, the useEffect will handle it
    };

    // Initialize component - now only responsible for initial fetch and liked talents
    useEffect(() => {
        const category = searchParams.get('category');
        if (category) {
            setSelectedCategory(category);
        }

        fetchTalents();

        // Fetch liked talents if user is logged in
        const fetchLikedTalents = async () => {
            if (user) {
                try {
                    const response = await axios.get('/api/talent/liked');
                    setLikedTalents(new Set(response.data.map(t => t._id)));
                } catch (err) {
                    console.error('Error fetching liked talents:', err);
                }
            }
        };

        fetchLikedTalents();
    }, [searchParams, user, fetchTalents]); // searchParams and user are stable dependencies, fetchTalents is now stable

    // Render star rating
    const renderStars = (rating = 4) => {
        return Array(5).fill(0).map((_, i) => (
            i < Math.floor(rating) ?
                <FaStar key={i} style={{ color: '#f59e0b' }} /> :
                <FaRegStar key={i} style={{ color: '#f59e0b' }} />
        ));
    };

    const renderTalentCard = (talent) => {
        const isLiked = likedTalents.has(talent._id);
        return (
            <div
                key={talent._id}
                className="talent-card"
                onMouseEnter={(e) => e.currentTarget.classList.add('talent-card-hover')}
                onMouseLeave={(e) => e.currentTarget.classList.remove('talent-card-hover')}
            >
                <div className="talent-info">
                    <div className="talent-header">
                        <div className="profile-pic-container">
                            {talent.profilePic ? (
                                <img
                                    src={talent.profilePic}
                                    alt={talent.name}
                                    className="profile-pic"
                                />
                            ) : (
                                <div className="profile-pic-placeholder">
                                    <span className="initials">
                                        {talent.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="name-category-group">
                            <h3 className="talent-name">{talent.name}</h3>
                            <p className="talent-category">{talent.category}</p>
                        </div>
                    </div>

                    <div className="talent-stats">
                        <div className="stat-item">
                            <FaBriefcase className="stat-icon" />
                            <span>{talent.experience} years</span>
                        </div>
                        <div className="stat-item">
                            <FaMoneyBillWave className="stat-icon" />
                            <span>${talent.hourlyRate}/hr</span>
                        </div>
                        <div className="stat-item">
                            <FaMapMarkerAlt className="stat-icon" />
                            <span>{talent.location}</span>
                        </div>
                        <div className="stat-item">
                            <FaUserTie className="stat-icon" />
                            <span className="availability-text">{talent.availability}</span>
                        </div>
                    </div>

                    <div className="skills-container">
                        {talent.skills.map((skill, index) => (
                            <span key={index} className="skill-tag">
                                {skill}
                            </span>
                        ))}
                    </div>

                    <div className="work-samples-preview">
                        {workSamples[talent._id]?.slice(0, 3).map((sample, idx) => (
                            <div key={idx} className="sample-thumbnail">
                                {sample.type === 'image' ? (
                                    <FaImage className="sample-icon" />
                                ) : sample.type === 'video' ? (
                                    <FaVideo className="sample-icon" />
                                ) : (
                                    <FaLink className="sample-icon" />
                                )}
                            </div>
                        ))}
                        {(!workSamples[talent._id] || workSamples[talent._id].length === 0) && (
                            <div className="no-work-samples">
                                No work samples available
                            </div>
                        )}
                    </div>

                    <div className="card-actions">
                        <button
                            className={`like-button ${isLiked ? 'liked' : ''}`}
                            onClick={(e) => handleLikeTalent(talent._id, e)}
                        >
                            {isLiked ? <FaStar /> : <FaRegStar />}
                        </button>
                        <button
                            className="view-details-button"
                            onClick={() => handleViewDetails(talent)}
                        >
                            View Details
                        </button>
                    </div>

                    <Link
                        to={`/book-talent/${talent._id}`}
                        className="book-button"
                    >
                        Book Now
                    </Link>
                </div>
            </div>
        );
    };

    if (showTalentDetails) {
        return (
            <div className="modal">
                <div className="modal-content">
                    <div className="modal-header">
                        <div>
                            <h2 className="modal-title">{showTalentDetails.name}</h2>
                            <p className="modal-category">{showTalentDetails.category} Professional</p>
                        </div>
                        <button
                            onClick={() => setShowTalentDetails(null)}
                            className="close-button"
                        >
                            &times;
                        </button>
                    </div>

                    <div className="modal-grid">
                        <div>
                            <h3 className="modal-section-title">About</h3>
                            <p className="modal-text">{showTalentDetails.bio || 'No bio available'}</p>

                            <h3 className="modal-section-title">Skills</h3>
                            <div className="modal-skills-container">
                                {Array.isArray(showTalentDetails.skills) ? (
                                    showTalentDetails.skills.map((skill, index) => (
                                        <span key={index} className="skill-tag-modal">
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <span className="modal-text">No skills listed</span>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="details-box">
                                <h3 className="modal-section-title">Details</h3>
                                <div className="details-grid">
                                    <div className="detail-row">
                                        <span className="detail-row-label">Experience:</span>
                                        <span className="detail-row-value">{showTalentDetails.experience} years</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-row-label">Hourly Rate:</span>
                                        <span className="detail-row-value">${showTalentDetails.hourlyRate}/hr</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-row-label">Location:</span>
                                        <span className="detail-row-value">{showTalentDetails.location}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-row-label">Availability:</span>
                                        <span className="detail-row-value">{showTalentDetails.availability}</span>
                                    </div>
                                </div>
                            </div>

                            {user && user.role === 'client' && (
                                <button
                                    onClick={() => handleBookTalent(showTalentDetails)}
                                    className="modal-book-button"
                                >
                                    Book {showTalentDetails.name.split(' ')[0]}
                                </button>
                            )}
                        </div>
                    </div>

                    {showTalentDetails.portfolio && (
                        <div className="portfolio-section">
                            <h3 className="modal-section-title">Portfolio</h3>
                            <a
                                href={showTalentDetails.portfolio}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="portfolio-link"
                            >
                                View Portfolio
                            </a>
                        </div>
                    )}

                    {workSamples[showTalentDetails._id]?.length > 0 && (
                        <div className="work-samples-section">
                            <h3 className="modal-section-title">Work Samples</h3>
                            <div className="work-samples-grid">
                                {workSamples[showTalentDetails._id].map((sample, idx) => (
                                    <div
                                        key={idx}
                                        className="work-sample-card"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(sample.url, '_blank');
                                        }}
                                    >
                                        <div className="work-sample-thumbnail-container">
                                            {sample.type === 'image' ? (
                                                <img
                                                    src={sample.thumbnail || sample.url}
                                                    alt={sample.title || 'Work sample'}
                                                    className="work-sample-image"
                                                />
                                            ) : sample.type === 'video' ? (
                                                <FaVideo className="work-sample-icon" />
                                            ) : (
                                                <FaLink className="work-sample-icon" />
                                            )}
                                        </div>
                                        <div className="work-sample-info">
                                            <h4 className="work-sample-title">
                                                {sample.title || 'Untitled'}
                                            </h4>
                                            <p className="work-sample-type">
                                                {sample.type.charAt(0).toUpperCase() + sample.type.slice(1)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Main component return
    return (
        <div className="explore-talent-container">
            <h1 className="explore-talent-header">Explore Talents</h1>

            <div className="category-tabs">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
                        onClick={() => handleCategorySelect(category.id)}
                    >
                        {category.icon}
                        {category.name}
                    </button>
                ))}
            </div>

            <div className="search-section">
                <div className="search-bar-container">
                    <input
                        type="text"
                        placeholder="Search talents by name, skills"
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch();
                            }
                        }}
                    />
                    <button className="search-button" onClick={handleSearch}>
                        <FaSearch />
                    </button>
                </div>
                <select
                    className="availability-dropdown"
                    value={availabilityFilter}
                    onChange={(e) => handleAvailabilityChange(e.target.value)}
                >
                    <option value="all">All Availability</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="freelance">Freelance</option>
                    <option value="contract">Contract</option>
                </select>
            </div>

            <h2 className="section-title">Technical Talents</h2>

            {loading ? (
                <div className="centered-container">
                    <div className="loading-spinner"></div>
                    <p className="message-text">Loading talents...</p>
                </div>
            ) : error ? (
                <div className="centered-container error-message">
                    <p>{error}</p>
                </div>
            ) : filteredTalents.length > 0 ? (
                <div className="talent-grid">
                    {filteredTalents.map((talent) => renderTalentCard(talent))}
                </div>
            ) : (
                <p className="no-talents-found">No talents found matching your criteria.</p>
            )}

            {/* Talent Details Modal */}
            {showTalentDetails && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">{showTalentDetails.name}</h2>
                                <p className="modal-category">{showTalentDetails.category} Professional</p>
                            </div>
                            <button
                                onClick={() => setShowTalentDetails(null)}
                                className="close-button"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="modal-grid">
                            <div>
                                <h3 className="modal-section-title">About</h3>
                                <p className="modal-text">{showTalentDetails.bio || 'No bio available'}</p>

                                <h3 className="modal-section-title">Skills</h3>
                                <div className="modal-skills-container">
                                    {Array.isArray(showTalentDetails.skills) ? (
                                        showTalentDetails.skills.map((skill, index) => (
                                            <span key={index} className="skill-tag-modal">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="modal-text">No skills listed</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="details-box">
                                    <h3 className="modal-section-title">Details</h3>
                                    <div className="details-grid">
                                        <div className="detail-row">
                                            <span className="detail-row-label">Experience:</span>
                                            <span className="detail-row-value">{showTalentDetails.experience} years</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-row-label">Hourly Rate:</span>
                                            <span className="detail-row-value">${showTalentDetails.hourlyRate}/hr</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-row-label">Location:</span>
                                            <span className="detail-row-value">{showTalentDetails.location}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-row-label">Availability:</span>
                                            <span className="detail-row-value">{showTalentDetails.availability}</span>
                                        </div>
                                    </div>
                                </div>

                                {user && user.role === 'client' && (
                                    <button
                                        onClick={() => handleBookTalent(showTalentDetails)}
                                        className="modal-book-button"
                                    >
                                        Book {showTalentDetails.name.split(' ')[0]}
                                    </button>
                                )}
                            </div>
                        </div>

                        {showTalentDetails.portfolio && (
                            <div className="portfolio-section">
                                <h3 className="modal-section-title">Portfolio</h3>
                                <a
                                    href={showTalentDetails.portfolio}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="portfolio-link"
                                >
                                    View Portfolio
                                </a>
                            </div>
                        )}

                        {workSamples[showTalentDetails._id]?.length > 0 && (
                            <div className="work-samples-section">
                                <h3 className="modal-section-title">Work Samples</h3>
                                <div className="work-samples-grid">
                                    {workSamples[showTalentDetails._id].map((sample, idx) => (
                                        <div
                                            key={idx}
                                            className="work-sample-card"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(sample.url, '_blank');
                                            }}
                                        >
                                            <div className="work-sample-thumbnail-container">
                                                {sample.type === 'image' ? (
                                                    <img
                                                        src={sample.thumbnail || sample.url}
                                                        alt={sample.title || 'Work sample'}
                                                        className="work-sample-image"
                                                    />
                                                ) : sample.type === 'video' ? (
                                                    <FaVideo className="work-sample-icon" />
                                                ) : (
                                                    <FaLink className="work-sample-icon" />
                                                )}
                                            </div>
                                            <div className="work-sample-info">
                                                <h4 className="work-sample-title">
                                                    {sample.title || 'Untitled'}
                                                </h4>
                                                <p className="work-sample-type">
                                                    {sample.type.charAt(0).toUpperCase() + sample.type.slice(1)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExploreTalent;
