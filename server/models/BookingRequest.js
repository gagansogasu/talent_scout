const mongoose = require('mongoose');

const bookingRequestSchema = new mongoose.Schema({
    recruiter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    talent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    talentProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TalentProfile',
        required: true,
    },
    projectDate: {
        type: Date,
        required: true,
    },
    duration: {
        type: Number, // in hours
        required: true,
    },
    budget: {
        type: Number,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update the updatedAt timestamp before saving
bookingRequestSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('BookingRequest', bookingRequestSchema);
