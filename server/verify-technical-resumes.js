const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const TalentProfile = require('./models/TalentProfile');

async function verifyTechnicalTalentResumes() {
    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    try {
        const talentsWithDummyResume = await TalentProfile.find({
            category: 'Technical',
            resume: 'uploads/dummy.pdf'
        });

        if (talentsWithDummyResume.length === 0) {
            console.log('✅ Verification successful: No technical talents found with dummy resumes.');
        } else {
            console.log(`❌ Verification failed: Found ${talentsWithDummyResume.length} technical talents still with dummy resumes:`);
            talentsWithDummyResume.forEach(t => {
                console.log(`- ${t.name} (ID: ${t._id})`);
            });
        }

    } catch (error) {
        console.error('Error during verification:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

verifyTechnicalTalentResumes().catch(err => {
    console.error('Verification script error:', err);
}); 