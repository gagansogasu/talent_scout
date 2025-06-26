import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalBookings: 0,
        pendingBookings: 0,
        completedBookings: 0,
        earnings: 0
    });
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/booking/dashboard', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(response.data.stats);
                setRecentBookings(response.data.recentBookings);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleBookingStatus = async (bookingId, newStatus) => {
        try {
            const token = localStorage.getItem('token');

            // Log user details with clear formatting
            console.log('=== USER DETAILS ===');
            console.log('User ID:', user?.id);
            console.log('User Role:', user?.role);
            console.log('User Name:', user?.name);
            console.log('==================');

            // Log request details
            console.log('=== REQUEST DETAILS ===');
            console.log('Booking ID:', bookingId);
            console.log('New Status:', newStatus);
            console.log('Token exists:', !!token);
            console.log('=====================');

            // Check if user is talent
            if (user?.role !== 'talent') {
                console.error('User is not a talent:', user?.role);
                throw new Error('Only talents can update booking status');
            }

            // Check if token exists
            if (!token) {
                console.error('No authentication token found');
                throw new Error('Authentication required');
            }

            await axios.put(`http://localhost:5000/api/booking/${bookingId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Refresh dashboard data after status update
            const response = await axios.get('http://localhost:5000/api/booking/dashboard', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data.stats);
            setRecentBookings(response.data.recentBookings);
        } catch (error) {
            console.error('=== ERROR DETAILS ===');
            console.error('Status:', error.response?.status);
            console.error('Message:', error.response?.data?.message);
            console.error('User:', {
                id: user?.id,
                role: user?.role,
                name: user?.name
            });
            console.error('==================');
        }
    };

    const getStatusStyle = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'booking-status status-pending';
            case 'accepted':
                return 'booking-status status-completed';
            case 'rejected':
                return 'booking-status status-cancelled';
            default:
                return 'booking-status';
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Welcome back, {user?.name || 'User'}!</h1>
                <p className="dashboard-subtitle">Here's what's happening with your bookings</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-title">Total Bookings</div>
                    <div className="stat-value">{stats.totalBookings}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-title">Pending Bookings</div>
                    <div className="stat-value">{stats.pendingBookings}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-title">Completed Bookings</div>
                    <div className="stat-value">{stats.completedBookings}</div>
                </div>
                {user?.role === 'talent' && (
                    <div className="stat-card">
                        <div className="stat-title">Total Earnings</div>
                        <div className="stat-value">${stats.earnings}</div>
                    </div>
                )}
            </div>

            {user?.role === 'talent' && (
                <div className="bookings-section">
                    <h2 className="section-title">Pending Booking Requests</h2>
                    {recentBookings.filter(booking => booking.status === 'pending').length > 0 ? (
                        recentBookings
                            .filter(booking => booking.status === 'pending')
                            .map((booking) => (
                                <div key={booking._id} className="booking-card">
                                    <div className="booking-header">
                                        <h3 className="booking-title">
                                            Booking Request from {booking.recruiter?.name || 'N/A'}
                                        </h3>
                                        <span className={getStatusStyle(booking.status)}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <div className="booking-details">
                                        <p>Date: {booking.projectDate}</p>
                                        <p>Duration: {booking.duration} hours</p>
                                        <p>Budget: ${booking.budget}</p>
                                        <p>Recruiter: {booking.recruiter?.email}</p>
                                        <p>Message: {booking.message}</p>
                                    </div>
                                    <div className="booking-actions">
                                        <button
                                            className="accept-button"
                                            onClick={() => handleBookingStatus(booking._id, 'accepted')}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            className="reject-button"
                                            onClick={() => handleBookingStatus(booking._id, 'rejected')}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))
                    ) : (
                        <p>No pending booking requests.</p>
                    )}
                </div>
            )}

            <div className="bookings-section">
                <h2 className="section-title">Recent Bookings</h2>
                {recentBookings.length > 0 ? (
                    recentBookings.map((booking) => (
                        <div key={booking._id} className="booking-card">
                            <div className="booking-header">
                                <h3 className="booking-title">
                                    {user?.role === 'talent' ? `Booking from ${booking.recruiter?.name || 'N/A'}` : `Booking for ${booking.talent?.name || 'N/A'}`}
                                </h3>
                                <span className={getStatusStyle(booking.status)}>
                                    {booking.status}
                                </span>
                            </div>
                            <div className="booking-details">
                                <p>Date: {booking.projectDate}</p>
                                <p>Duration: {booking.duration} hours</p>
                                <p>Budget: ${booking.budget}</p>
                                {user?.role === 'talent' && <p>Recruiter: {booking.recruiter?.email}</p>}
                                {user?.role === 'recruiter' && <p>Talent: {booking.talent?.email}</p>}
                                {booking.message && <p>Message: {booking.message}</p>}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No recent bookings to display.</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard; 