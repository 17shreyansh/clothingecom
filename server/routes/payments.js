const express = require('express');
const {
  createRazorpayOrder,
  verifyPayment,
  razorpayWebhook
} = require('../controllers/payments');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);

// Webhook route (no auth required)
router.post('/webhook', razorpayWebhook);

module.exports = router;