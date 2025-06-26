const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const TalentProfile = require('./models/TalentProfile');

async function updateTechnicalTalentResumes() {
    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    try {
        // Find up to 5 technical talents with the dummy resume path
        const technicalTalents = await TalentProfile.find({
            category: 'Technical',
            resume: 'uploads/dummy.pdf' // Assuming dummy.pdf is the placeholder
        }).limit(5);

        if (technicalTalents.length === 0) {
            console.log('No technical talents found with dummy resumes to update.');
            await mongoose.disconnect();
            return;
        }

        console.log(`Found ${technicalTalents.length} technical talents to update.`);

        for (let i = 0; i < technicalTalents.length; i++) {
            const talent = technicalTalents[i];
            const newResumePath = `uploads/technical_resume_${i + 1}.pdf`;

            talent.resume = newResumePath;
            await talent.save();
            console.log(`Updated resume for ${talent.name} (ID: ${talent._id}) to: ${newResumePath}`);
        }

        console.log('Finished updating technical talent resumes.');

    } catch (error) {
        console.error('Error updating technical talent resumes:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

updateTechnicalTalentResumes().catch(err => {
    console.error('Script error:', err);
}); 