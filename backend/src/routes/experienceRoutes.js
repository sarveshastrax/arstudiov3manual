const express = require('express');
const router = express.Router();
const {
    createExperience,
    saveExperience,
    publishExperience,
    getExperience,
    getPublicExperience,
    getUserExperiences
} = require('../controllers/experienceController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createExperience);
router.get('/', protect, getUserExperiences);
router.get('/:id', protect, getExperience);
router.put('/:id', protect, saveExperience);
router.post('/:id/publish', protect, publishExperience);

// Public route
router.get('/public/:id', getPublicExperience);

module.exports = router;
