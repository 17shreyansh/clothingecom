const express = require('express');
const {
  validateDiscountCode,
  contactUs
} = require('../controllers/users');
const { protect, optionalAuth } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.post('/contact', contactUs);

// Protected routes
router.post('/validate-discount', protect, validateDiscountCode);

module.exports = router;