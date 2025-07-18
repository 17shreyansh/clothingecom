const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getHomepageContent,
  updateHomepageContent,
  uploadImage,
  updateSectionsOrder,
  toggleSectionVisibility
} = require('../controllers/homepageContent');

// Public routes
router.get('/', getHomepageContent);
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Homepage API is working' });
});

// Admin routes
router.put('/:section', protect, admin, updateHomepageContent);
router.post('/upload', protect, admin, uploadImage);
router.put('/sections/order', protect, admin, updateSectionsOrder);
router.put('/sections/:section/visibility', protect, admin, toggleSectionVisibility);

module.exports = router;