const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const TalentProfile = require('./models/TalentProfile');

const PLACEHOLDER_RESUME = 'uploads/placeholder.pdf';

async function checkAndFixTalentResumes() {
    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Find all talents missing a resume
    const missingResumes = await TalentProfile.find({ $or: [{ resume: { $exists: false } }, { resume: '' }] });

    if (missingResumes.length === 0) {
        console.log('All talents have a resume.');
    } else {
        console.log(`Found ${missingResumes.length} talents missing a resume:`);
        missingResumes.forEach(t => {
            console.log(`- ${t.name} (${t.email}) [ID: ${t._id}]`);
        });

        // Optionally, set a placeholder resume for those missing
        for (const talent of missingResumes) {
            talent.resume = PLACEHOLDER_RESUME;
            await talent.save();
            console.log(`Set placeholder resume for: ${talent.name} (${talent.email})`);
        }
    }

    await mongoose.disconnect();
    console.log('Check complete. Disconnected from MongoDB.');
}

checkAndFixTalentResumes().catch(err => {
    console.error('Error:', err);
    mongoose.disconnect();
}); 