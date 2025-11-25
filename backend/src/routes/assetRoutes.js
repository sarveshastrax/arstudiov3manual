const express = require('express');
const router = express.Router();
const { getUploadUrl, deleteAsset, getUserAssets } = require('../controllers/assetController');
const { protect } = require('../middleware/authMiddleware');

router.post('/upload-url', protect, getUploadUrl);
router.get('/', protect, getUserAssets);
router.delete('/:id', protect, deleteAsset);

module.exports = router;
