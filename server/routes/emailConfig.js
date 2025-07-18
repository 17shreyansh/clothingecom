const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getEmailConfig,
  updateEmailConfig,
  testEmail
} = require('../controllers/emailConfig');

router.get('/', protect, admin, getEmailConfig);
router.put('/', protect, admin, updateEmailConfig);
router.post('/test', protect, admin, testEmail);

module.exports = router;