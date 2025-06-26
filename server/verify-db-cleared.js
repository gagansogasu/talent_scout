const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function verifyDatabaseCleared() {
    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB.');

    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        if (collections.length === 0) {
            console.log('✅ Database successfully cleared: No collections found.');
        } else {
            console.log('❌ Database not fully cleared. Remaining collections:');
            collections.forEach(c => console.log(`- ${c.name}`));
        }
    } catch (error) {
        console.error('Error during database verification:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

verifyDatabaseCleared().catch(err => {
    console.error('Script error:', err);
}); 