const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const BookingRequest = require('../models/BookingRequest');
const User = require('../models/User');
const TalentProfile = require('../models/TalentProfile');

// Create a booking request
router.post('/request', auth, async (req, res) => {
    try {
        console.log('Received booking request:', req.body);
        console.log('Authenticated user in booking request:', req.user);
        const { role } = req.user;
        if (role !== 'recruiter') {
            return res.status(403).json({ message: 'Only recruiters can create booking requests' });
        }

        const {
            talentId,
            projectDate,
            duration,
            budget,
            message,
        } = req.body;

        console.log('req.user in booking route:', req.user);

        // Check if talent exists and has a profile
        const talentProfile = await TalentProfile.findOne({ user: talentId });
        if (!talentProfile) {
            return res.status(404).json({ message: 'Talent profile not found' });
        }

        // Create booking request
        const bookingRequest = new BookingRequest({
            recruiter: req.user.id,
            talent: talentId,
            talentProfile: talentProfile._id,
            projectDate,
            duration,
            budget,
            message,
        });

        await bookingRequest.save();
        res.status(201).json(bookingRequest);
    } catch (error) {
        console.error('Create booking request error:', error.stack);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get booking requests for a talent
router.get('/talent', auth, async (req, res) => {
    try {
        const { role } = req.user;
        if (role !== 'talent') {
            return res.status(403).json({ message: 'Only talents can view their booking requests' });
        }

        const bookingRequests = await BookingRequest.find({ talent: req.user.userId })
            .populate('recruiter', 'name email phone')
            .populate('talentProfile')
            .sort({ createdAt: -1 });

        res.json(bookingRequests);
    } catch (error) {
        console.error('Get talent booking requests error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get booking requests for a recruiter
router.get('/recruiter', auth, async (req, res) => {
    try {
        const { role } = req.user;
        if (role !== 'recruiter') {
            return res.status(403).json({ message: 'Only recruiters can view their booking requests' });
        }

        const bookingRequests = await BookingRequest.find({ recruiter: req.user.userId })
            .populate('talent', 'name email phone')
            .populate('talentProfile')
            .sort({ createdAt: -1 });

        res.json(bookingRequests);
    } catch (error) {
        console.error('Get recruiter booking requests error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update booking request status
router.put('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const { role, id: userId } = req.user;

        console.log('=== BOOKING STATUS UPDATE REQUEST ===');
        console.log('Request details:', {
            bookingId: req.params.id,
            newStatus: status,
            userRole: role,
            userId: userId
        });

        const bookingRequest = await BookingRequest.findById(req.params.id);
        if (!bookingRequest) {
            console.log('Booking request not found:', req.params.id);
            return res.status(404).json({ message: 'Booking request not found' });
        }

        console.log('Booking details:', {
            bookingId: bookingRequest._id,
            talentId: bookingRequest.talent.toString(),
            currentStatus: bookingRequest.status,
            recruiterId: bookingRequest.recruiter.toString()
        });

        // Only talent can update the status
        if (role !== 'talent') {
            console.log('Authorization failed - wrong role:', {
                userRole: role,
                requiredRole: 'talent'
            });
            return res.status(403).json({ message: 'Only talents can update booking status' });
        }

        if (bookingRequest.talent.toString() !== userId) {
            console.log('Authorization failed - wrong user:', {
                userId: userId,
                bookingTalentId: bookingRequest.talent.toString()
            });
            return res.status(403).json({ message: 'Not authorized to update this booking request' });
        }

        bookingRequest.status = status;
        await bookingRequest.save();

        console.log('Booking status updated successfully:', {
            bookingId: bookingRequest._id,
            newStatus: status
        });
        console.log('===================================');

        res.json(bookingRequest);
    } catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get dashboard data for talent or recruiter
router.get('/dashboard', auth, async (req, res) => {
    try {
        const { role, id: userId } = req.user;
        let totalBookings = 0;
        let pendingBookings = 0;
        let completedBookings = 0;
        let earnings = 0;
        let recentBookings = [];

        if (role === 'talent') {
            // For talents: get bookings where they are the talent
            console.log(`Fetching bookings for talent userId: ${userId}`);
            const bookings = await BookingRequest.find({ talent: userId })
                .populate('recruiter', 'name email phone')
                .sort({ createdAt: -1 });

            console.log('Bookings found for talent:', bookings.length);
            console.log('Sample booking (first one):', bookings[0]);

            totalBookings = bookings.length;
            pendingBookings = bookings.filter(b => b.status === 'pending').length;
            completedBookings = bookings.filter(b => b.status === 'accepted').length;
            // Assuming earnings could be derived from completed bookings' budget, or add a specific field
            earnings = bookings.filter(b => b.status === 'accepted').reduce((sum, b) => sum + (b.budget || 0), 0);
            recentBookings = bookings.slice(0, 5); // Get latest 5

        } else if (role === 'recruiter') {
            // For recruiters: get bookings where they are the recruiter
            const bookings = await BookingRequest.find({ recruiter: userId })
                .populate('talent', 'name email phone')
                .sort({ createdAt: -1 });

            totalBookings = bookings.length;
            pendingBookings = bookings.filter(b => b.status === 'pending').length;
            completedBookings = bookings.filter(b => b.status === 'accepted').length;
            // Assuming earnings could be derived from completed bookings' budget, or add a specific field
            earnings = bookings.filter(b => b.status === 'accepted').reduce((sum, b) => sum + (b.budget || 0), 0);
            recentBookings = bookings.slice(0, 5); // Get latest 5
        }

        // Format recent bookings to match frontend expectations
        const formattedRecentBookings = recentBookings.map(booking => ({
            _id: booking._id,
            status: booking.status,
            projectDate: booking.projectDate, // Using existing projectDate from schema
            duration: booking.duration,       // Using existing duration from schema
            budget: booking.budget,           // Using existing budget from schema
            // For Dashboard.js, it expects 'date', 'time', 'amount' fields directly. Let's map them.
            // You might need to adjust your frontend if projectDate is not a simple Date object
            date: booking.projectDate, // Extracting start date for display
            time: 'N/A', // No explicit time in your schema, set to N/A or derive if possible
            amount: booking.budget, // Map budget to amount for display
            // Populate talent/recruiter details
            talent: booking.talent ? { name: booking.talent.name, email: booking.talent.email } : null,
            recruiter: booking.recruiter ? { name: booking.recruiter.name, email: booking.recruiter.email } : null,
        }));

        res.json({
            stats: {
                totalBookings,
                pendingBookings,
                completedBookings,
                earnings,
            },
            recentBookings: formattedRecentBookings,
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- TEMPORARY TEST ROUTE --- //
router.post('/test', (req, res) => {
    console.log('Backend: Received POST request to /api/booking/test');
    res.status(200).json({ message: 'Test POST to booking route successful!' });
});
// --- END TEMPORARY TEST ROUTE --- //

module.exports = router;
