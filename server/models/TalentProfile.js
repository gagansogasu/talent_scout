const mongoose = require('mongoose');

const talentProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['Showbizz', 'Household', 'Technical', 'Creative', 'Professional', 'Other'],
    },
    skills: [{
        type: String,
        required: true,
    }],
    experience: {
        type: String,
        required: true,
        enum: ['0-1', '1-3', '3-5', '5-10', '10+']
    },
    hourlyRate: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: true
    },
    portfolio: {
        type: String
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }],
    availability: {
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'freelance'],
        default: 'full-time',
        required: true
    },
    resume: {
        type: String,
        required: true,
    },
    resumeText: {
        type: String,
        default: ''
    },
    profilePic: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
talentProfileSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('TalentProfile', talentProfileSchema);
