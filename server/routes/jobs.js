const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { auth, checkRole } = require('../middleware/auth');

// Get all jobs
router.get('/', async (req, res) => {
    try {
        const { search, type, location } = req.query;
        const query = { status: 'active' };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (type) query.type = type;
        if (location) query.location = { $regex: location, $options: 'i' };

        const jobs = await Job.find(query)
            .populate('employer', 'firstName lastName email')
            .sort({ createdAt: -1 });

        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching jobs', error: error.message });
    }
});

// Get single job
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('employer', 'firstName lastName email')
            .populate('applications.applicant', 'firstName lastName email');

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.json(job);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching job', error: error.message });
    }
});

// Create job (employer only)
router.post('/', auth, checkRole(['employer', 'admin']), async (req, res) => {
    try {
        const job = new Job({
            ...req.body,
            employer: req.user._id
        });

        await job.save();
        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ message: 'Error creating job', error: error.message });
    }
});

// Update job (employer only)
router.put('/:id', auth, checkRole(['employer', 'admin']), async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        Object.assign(job, req.body);
        await job.save();

        res.json(job);
    } catch (error) {
        res.status(500).json({ message: 'Error updating job', error: error.message });
    }
});

// Delete job (employer only)
router.delete('/:id', auth, checkRole(['employer', 'admin']), async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await job.remove();
        res.json({ message: 'Job deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting job', error: error.message });
    }
});

// Apply for job
router.post('/:id/apply', auth, checkRole(['jobseeker']), async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.status !== 'active') {
            return res.status(400).json({ message: 'Job is not active' });
        }

        // Check if already applied
        const alreadyApplied = job.applications.some(
            app => app.applicant.toString() === req.user._id.toString()
        );

        if (alreadyApplied) {
            return res.status(400).json({ message: 'Already applied for this job' });
        }

        job.applications.push({
            applicant: req.user._id,
            resume: req.body.resume,
            coverLetter: req.body.coverLetter
        });

        await job.save();
        res.status(201).json({ message: 'Application submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error applying for job', error: error.message });
    }
});

module.exports = router; 