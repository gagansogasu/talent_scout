const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function checkUser(email) {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        const user = await User.findOne({ email });
        console.log('User found:', user);
        
        if (user) {
            console.log('User details:', {
                id: user._id,
                email: user.email,
                password: user.password,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                createdAt: user.createdAt
            });
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

// Get email from command line argument or use the test email
const email = process.argv[2] || 'test@example.com';
checkUser(email);
