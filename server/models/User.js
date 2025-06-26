const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot be more than 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot be more than 50 characters']
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    role: {
        type: String,
        enum: {
            values: ['talent', 'recruiter'],
            message: 'Role must be either talent or recruiter'
        },
        default: 'talent',
        required: true
    },
    phone: {
        type: String,
        trim: true,
        match: [/^[0-9\-\+\s]*$/, 'Please enter a valid phone number']
    },
    profilePicture: {
        type: String,
        default: ''
    },
    profile: {
        skills: [{
            type: String,
            trim: true
        }],
        experience: [{
            title: {
                type: String,
                required: true,
                trim: true
            },
            company: {
                type: String,
                required: true,
                trim: true
            },
            startDate: {
                type: Date,
                required: true
            },
            endDate: Date,
            current: {
                type: Boolean,
                default: false
            },
            description: {
                type: String,
                trim: true
            }
        }],
        education: [{
            degree: {
                type: String,
                required: true,
                trim: true
            },
            institution: {
                type: String,
                required: true,
                trim: true
            },
            graduationYear: Number
        }],
        resume: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    applications: [{
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job',
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'reviewed', 'accepted', 'rejected'],
            default: 'pending'
        },
        appliedAt: {
            type: Date,
            default: Date.now
        },
        resume: {
            type: String,
            required: true
        },
        coverLetter: {
            type: String
        }
    }]
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    try {
        // Only hash the password if it has been modified (or is new)
        if (this.isModified('password')) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
        
        // Update name field if firstName or lastName changes
        if (this.isModified('firstName') || this.isModified('lastName')) {
            this.name = `${this.firstName} ${this.lastName}`.trim();
        }
        
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Create a virtual for full name
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`.trim();
});

// Ensure virtual fields are included when converting to JSON
userSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        // Remove sensitive information from JSON output
        delete ret.password;
        delete ret.__v;
        return ret;
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
