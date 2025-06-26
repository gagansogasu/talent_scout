const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
    try {
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Successfully connected to MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error.message);
        console.log('\nPlease make sure:');
        console.log('1. MongoDB is installed and running locally');
        console.log('2. The MongoDB server is running on port 27017');
        console.log('3. The database name in .env matches an existing database');
        process.exit(1);
    }
}

testConnection();
