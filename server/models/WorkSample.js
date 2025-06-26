const mongoose = require('mongoose');

const workSampleSchema = new mongoose.Schema({
    talent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TalentProfile',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['image', 'video', 'link', 'document'],
        required: true
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    thumbnail: {
        type: String,
        trim: true
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

workSampleSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('WorkSample', workSampleSchema);
