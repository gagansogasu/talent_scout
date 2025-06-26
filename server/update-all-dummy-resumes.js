const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const TalentProfile = require('./models/TalentProfile');

const OLD_RESUME_PATH = 'uploads/dummy.pdf';
const NEW_RESUME_PATH = 'uploads/generic_placeholder.pdf';

async function updateAllDummyResumes() {
    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    try {
        console.log(`Searching for talents with resume path: ${OLD_RESUME_PATH}`);

        const result = await TalentProfile.updateMany(
            { resume: OLD_RESUME_PATH },
            { $set: { resume: NEW_RESUME_PATH } }
        );

        if (result.modifiedCount > 0) {
            console.log(`Successfully updated ${result.modifiedCount} talent profiles to use ${NEW_RESUME_PATH}`);
        } else {
            console.log('No talent profiles found with the old dummy resume path to update.');
        }

    } catch (error) {
        console.error('Error updating dummy resumes:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

updateAllDummyResumes().catch(err => {
    console.error('Script error:', err);
}); 