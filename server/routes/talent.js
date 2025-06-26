const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const TalentProfile = require('../models/TalentProfile');
const natural = require('natural');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// Helper function for cosine similarity
function cosineSimilarity(query, text) {
  if (!query || !text) return 0;

  const queryWords = query.toLowerCase().split(/\s+/);
  const textWords = text.toLowerCase().split(/\s+/);

  const queryVector = {};
  const textVector = {};

  // Create word frequency vectors
  queryWords.forEach(word => {
    queryVector[word] = (queryVector[word] || 0) + 1;
  });

  textWords.forEach(word => {
    textVector[word] = (textVector[word] || 0) + 1;
  });

  // Calculate dot product
  let dotProduct = 0;
  for (const word in queryVector) {
    if (textVector[word]) {
      dotProduct += queryVector[word] * textVector[word];
    }
  }

  // Calculate magnitudes
  const queryMagnitude = Math.sqrt(
    Object.values(queryVector).reduce((sum, val) => sum + val * val, 0)
  );
  const textMagnitude = Math.sqrt(
    Object.values(textVector).reduce((sum, val) => sum + val * val, 0)
  );

  // Avoid division by zero
  if (queryMagnitude === 0 || textMagnitude === 0) {
    return 0;
  }

  // Calculate cosine similarity
  return dotProduct / (queryMagnitude * textMagnitude);
}

// Helper function to extract text from resume files
async function extractTextFromResume(filePath, mimetype) {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return '';
  }

  try {
    if (mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // .docx files
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else if (mimetype === 'application/msword') {
      // .doc files (mammoth doesn't support .doc directly, might need a converter or separate library)
      console.warn(`Direct .doc parsing is not supported by mammoth. Consider converting .doc to .docx or using a different library for .doc files.`);
      return ''; // Return empty for unsupported .doc for now
    }
    return ''; // For unsupported file types
  } catch (error) {
    console.error(`Error extracting text from ${filePath} (${mimetype}):`, error);
    return '';
  }
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.fieldname === 'resume' && !['.pdf', '.doc', '.docx'].includes(ext)) {
      return cb(new Error('Invalid file type for resume. Only PDF and Word documents are allowed.'));
    }
    if (file.fieldname === 'profilePic' && !['.jpg', '.jpeg', '.png'].includes(ext)) {
      return cb(new Error('Invalid file type for profile picture. Only JPG and PNG images are allowed.'));
    }
    cb(null, true);
  },
});

// Configure multer for multiple file uploads
const uploadMultiple = upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'profilePic', maxCount: 1 }
]);

// Register talent profile
router.post('/register', auth, uploadMultiple, async (req, res) => {
  console.log('Talent registration request received');
  console.log('Request body:', req.body);
  console.log('Request files:', req.files);

  try {
    const { role, id: userId, email } = req.user;
    console.log('Authenticated user:', { userId, email, role });

    if (role !== 'talent') {
      return res.status(403).json({
        success: false,
        message: 'Only talents can register profiles'
      });
    }

    // Get form data
    const {
      name,
      phone,
      bio,
      category,
      skills,
      experience,
      hourlyRate,
      location,
      portfolio,
      availability
    } = req.body;

    // Validate required fields
    const requiredFields = ['name', 'phone', 'bio', 'category', 'experience', 'hourlyRate', 'location'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Check for required files
    if (!req.files || !req.files['resume']) {
      return res.status(400).json({
        success: false,
        message: 'Resume file is required'
      });
    }

    // Check if user already has a talent profile
    const existingProfile = await TalentProfile.findOne({ user: userId });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Talent profile already exists'
      });
    }

    // Process resume file
    const resumeFile = req.files['resume'][0];
    if (!resumeFile) {
      return res.status(400).json({
        success: false,
        message: 'Resume is required'
      });
    }

    // Process profile picture
    const profilePicFile = req.files['profilePic'] ? req.files['profilePic'][0] : null;

    let resumeText = '';
    if (resumeFile) {
      resumeText = await extractTextFromResume(resumeFile.path, resumeFile.mimetype);
    }

    try {
      // Parse skills array
      let skillsArray = [];
      try {
        skillsArray = JSON.parse(skills);
      } catch (e) {
        skillsArray = skills.split(',').map(skill => skill.trim());
      }

      // Create talent profile
      const talentProfile = new TalentProfile({
        user: userId,
        name: name,
        email: email,
        phone: phone,
        bio: bio,
        category: category,
        skills: skillsArray,
        experience: experience,
        hourlyRate: parseFloat(hourlyRate) || 0,
        location: location,
        portfolio: portfolio || '',
        availability: availability || 'full-time',
        resume: resumeFile.path,
        resumeText: resumeText,
        profilePic: profilePicFile ? profilePicFile.path : null
      });

      await talentProfile.save();

      console.log('Talent profile created successfully:', talentProfile);

      res.status(201).json({
        success: true,
        message: 'Talent profile created successfully',
        data: {
          id: talentProfile._id,
          name: talentProfile.name,
          email: talentProfile.email,
          category: talentProfile.category,
          skills: talentProfile.skills,
          experience: talentProfile.experience,
          hourlyRate: talentProfile.hourlyRate,
          availability: talentProfile.availability
        }
      });
    } catch (error) {
      console.error('Error saving talent profile:', error);
      // Clean up uploaded files if there was an error
      if (req.files) {
        Object.values(req.files).forEach(fileArray => {
          fileArray.forEach(file => {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          });
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Talent registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Search talents with AI ranking
router.get('/search', auth, async (req, res) => {
  try {
    const { query, category, availability } = req.query;
    let searchQuery = {};

    // Add filters
    if (category) {
      searchQuery.category = category;
    }
    if (availability) {
      searchQuery.availability = availability;
    }

    // Get all matching talent profiles
    const talentProfiles = await TalentProfile.find(searchQuery)
      .populate('user', 'name email phone profilePicture');

    // If there's a search query, rank the results using cosine similarity
    if (query) {
      const rankedProfiles = talentProfiles.map(profile => {
        const similarity = cosineSimilarity(
          query.toLowerCase(),
          profile.resumeText.toLowerCase()
        );
        return { ...profile.toObject(), similarity };
      });

      // Sort by similarity score
      rankedProfiles.sort((a, b) => b.similarity - a.similarity);
      return res.json(rankedProfiles);
    }

    res.json(talentProfiles);
  } catch (error) {
    console.error('Search talents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get talent profile by user ID or talent ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Backend: Received request for talent profile ID: ${id}`);

    // First try to find by talent ID
    let talentProfile = await TalentProfile.findById(id)
      .populate('user', 'name email phone profilePicture');

    if (talentProfile) {
      console.log('Backend: Talent profile found by _id:', talentProfile._id);
      console.log('Backend: Talent profile user data after populate:', talentProfile.user);
    }

    // If not found, try to find by user ID
    if (!talentProfile) {
      console.log('Backend: Talent profile not found by _id, trying to find by user ID...');
      talentProfile = await TalentProfile.findOne({ user: id })
        .populate('user', 'name email phone profilePicture');

      if (talentProfile) {
        console.log('Backend: Talent profile found by user ID:', talentProfile._id);
        console.log('Backend: Talent profile user data after populate (by user ID):', talentProfile.user);
      }
    }

    if (!talentProfile) {
      console.log('Backend: Talent profile not found for any method.');
      return res.status(404).json({ message: 'Talent profile not found' });
    }

    res.json(talentProfile);
  } catch (error) {
    console.error('Backend: Get talent profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Keep the old route for backward compatibility
router.get('/profile/:id', auth, async (req, res) => {
  try {
    const talentProfile = await TalentProfile.findOne({ user: req.params.id })
      .populate('user', 'name email phone profilePicture');

    if (!talentProfile) {
      return res.status(404).json({ message: 'Talent profile not found' });
    }

    res.json(talentProfile);
  } catch (error) {
    console.error('Get talent profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like a talent profile
router.post('/:id/like', auth, async (req, res) => {
  try {
    const talent = await TalentProfile.findById(req.params.id);
    if (!talent) {
      return res.status(404).json({ message: 'Talent profile not found' });
    }

    // Check if already liked
    if (talent.likes.includes(req.user._id)) {
      return res.status(400).json({ message: 'Talent already liked' });
    }

    // Add like
    talent.likes.push(req.user._id);
    await talent.save();

    res.json({ message: 'Talent liked successfully' });
  } catch (error) {
    console.error('Error liking talent:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Unlike a talent profile
router.delete('/:id/like', auth, async (req, res) => {
  try {
    const talent = await TalentProfile.findById(req.params.id);
    if (!talent) {
      return res.status(404).json({ message: 'Talent profile not found' });
    }

    // Check if not liked
    if (!talent.likes.includes(req.user._id)) {
      return res.status(400).json({ message: 'Talent not liked yet' });
    }

    // Remove like
    talent.likes = talent.likes.filter(likeId => !likeId.equals(req.user._id));
    await talent.save();

    res.json({ message: 'Talent unliked successfully' });
  } catch (error) {
    console.error('Error unliking talent:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's liked talents
router.get('/likes', auth, async (req, res) => {
  try {
    const talents = await TalentProfile.find({ likes: req.user._id });
    res.json({ likedTalents: talents.map(t => t._id) });
  } catch (error) {
    console.error('Error fetching liked talents:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
