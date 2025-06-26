const mongoose = require('mongoose');
const User = require('./models/User');
const TalentProfile = require('./models/TalentProfile');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
console.log('Loaded MONGODB_URI:', process.env.MONGODB_URI);

const domains = [
    'Showbizz',
    'Household',
    'Technical',
    'Creative',
    'Professional'
];

const experiences = ['0-1', '1-3', '3-5', '5-10', '10+'];
const availabilities = ['full-time', 'part-time', 'contract', 'freelance'];

const dummyResume = 'uploads/dummy.pdf';
const dummyProfilePic = 'uploads/dummy.jpg';

const talentsPerDomain = 5;

async function seedTalents() {
    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    for (const domain of domains) {
        for (let i = 1; i <= talentsPerDomain; i++) {
            const firstName = `${domain}Talent${i}`;
            const lastName = 'User';
            const name = `${firstName} ${lastName}`;
            const email = `${domain.toLowerCase()}${i}@example.com`;
            const phone = `+1234567890${i}`;
            const password = 'Password123!';
            const role = 'talent';
            const location = `City ${i}`;
            const experience = experiences[i % experiences.length];
            const availability = availabilities[i % availabilities.length];
            const hourlyRate = 50 + i * 10;
            const skills = [
                `${domain} Skill A`,
                `${domain} Skill B`,
                `${domain} Skill C`
            ];
            const bio = `This is a sample bio for ${name} in the ${domain} domain.`;
            const portfolio = `https://portfolio.example.com/${domain.toLowerCase()}${i}`;

            // Check if user already exists
            let user = await User.findOne({ email });
            if (!user) {
                user = new User({
                    firstName,
                    lastName,
                    name,
                    email,
                    password,
                    role,
                    phone
                });
                await user.save();
            }

            // Check if talent profile already exists
            let profile = await TalentProfile.findOne({ user: user._id });
            if (!profile) {
                profile = new TalentProfile({
                    user: user._id,
                    name,
                    email,
                    phone,
                    bio,
                    category: domain,
                    skills,
                    experience,
                    hourlyRate,
                    location,
                    portfolio,
                    availability,
                    resume: dummyResume,
                    resumeText: '',
                    profilePic: dummyProfilePic
                });
                await profile.save();
                console.log(`Seeded talent: ${name} (${domain})`);
            } else {
                console.log(`Talent already exists: ${name} (${domain})`);
            }
        }
    }

    await mongoose.disconnect();
    console.log('Seeding complete. Disconnected from MongoDB.');
}

seedTalents().catch(err => {
    console.error('Seeding error:', err);
    mongoose.disconnect();
}); 