const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function clearDatabase() {
    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB.');

    try {
        console.log('Dropping database...');
        await mongoose.connection.db.dropDatabase();
        console.log('✅ Database successfully dropped.');
    } catch (error) {
        console.error('❌ Error dropping database:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

clearDatabase().catch(err => {
    console.error('Script error:', err);
}); 