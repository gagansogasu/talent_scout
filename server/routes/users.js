const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Job = require('../models/Job');
const { auth, checkRole } = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['firstName', 'lastName', 'profile'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates' });
        }

        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();

        res.json(req.user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
});

// Get user's job applications
router.get('/applications', auth, checkRole(['jobseeker']), async (req, res) => {
    try {
        const jobs = await Job.find({
            'applications.applicant': req.user._id
        }).populate('employer', 'firstName lastName email');

        const applications = jobs.map(job => {
            const application = job.applications.find(
                app => app.applicant.toString() === req.user._id.toString()
            );
            return {
                job: {
                    id: job._id,
                    title: job.title,
                    company: job.company,
                    location: job.location,
                    type: job.type,
                    status: job.status
                },
                application: {
                    status: application.status,
                    appliedAt: application.appliedAt,
                    resume: application.resume,
                    coverLetter: application.coverLetter
                }
            };
        });

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching applications', error: error.message });
    }
});

// Get employer's posted jobs
router.get('/posted-jobs', auth, checkRole(['employer', 'admin']), async (req, res) => {
    try {
        const jobs = await Job.find({ employer: req.user._id })
            .populate('applications.applicant', 'firstName lastName email');
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posted jobs', error: error.message });
    }
});

// Update application status (employer only)
router.put('/applications/:jobId/:applicationId', auth, checkRole(['employer', 'admin']), async (req, res) => {
    try {
        const { jobId, applicationId } = req.params;
        const { status } = req.body;

        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const application = job.applications.id(applicationId);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        application.status = status;
        await job.save();

        res.json({ message: 'Application status updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating application status', error: error.message });
    }
});

// Get user's applications
router.get('/applications', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'applications',
            populate: {
                path: 'job',
                select: 'title company location type'
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const applications = user.applications.map(application => ({
            application: {
                status: application.status,
                appliedAt: application.appliedAt,
                resume: application.resume,
                coverLetter: application.coverLetter
            },
            job: application.job
        }));

        res.json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 