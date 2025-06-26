const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const WorkSample = require('../models/WorkSample');
const TalentProfile = require('../models/TalentProfile');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/work-samples/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|mp4|mov|avi|pdf|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only image, video and document files are allowed'));
        }
    },
});

// Get all work samples for a talent
router.get('/:talentId', auth, async (req, res) => {
    try {
        const { talentId } = req.params;

        // Verify talent exists
        const talent = await TalentProfile.findById(talentId);
        if (!talent) {
            return res.status(404).json({ message: 'Talent not found' });
        }

        const workSamples = await WorkSample.find({ talent: talentId })
            .sort({ createdAt: -1 });

        res.json(workSamples);
    } catch (error) {
        console.error('Error fetching work samples:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a work sample
router.post('/', auth, upload.single('file'), async (req, res) => {
    try {
        const { talentId, title, description, type } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Verify talent exists and user has permission
        const talent = await TalentProfile.findOne({
            _id: talentId,
            user: req.user.id
        });

        if (!talent) {
            // Clean up uploaded file if talent not found
            fs.unlinkSync(file.path);
            return res.status(404).json({ message: 'Talent profile not found or access denied' });
        }

        const workSample = new WorkSample({
            talent: talent._id,
            title,
            description,
            type,
            url: `/uploads/work-samples/${file.filename}`,
            thumbnail: type === 'image' ? `/uploads/work-samples/${file.filename}` : null
        });

        await workSample.save();
        res.status(201).json(workSample);
    } catch (error) {
        console.error('Error adding work sample:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a work sample
router.delete('/:id', auth, async (req, res) => {
    try {
        const workSample = await WorkSample.findById(req.params.id);

        if (!workSample) {
            return res.status(404).json({ message: 'Work sample not found' });
        }

        // Verify user owns the talent profile
        const talent = await TalentProfile.findOne({
            _id: workSample.talent,
            user: req.user.id
        });

        if (!talent) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Delete the file
        if (fs.existsSync(`.${workSample.url}`)) {
            fs.unlinkSync(`.${workSample.url}`);
        }

        if (workSample.thumbnail && workSample.thumbnail !== workSample.url &&
            fs.existsSync(`.${workSample.thumbnail}`)) {
            fs.unlinkSync(`.${workSample.thumbnail}`);
        }

        await workSample.deleteOne();
        res.json({ message: 'Work sample deleted successfully' });
    } catch (error) {
        console.error('Error deleting work sample:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
