const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { 
  getSalesAnalytics, 
  getTopProducts, 
  getPaymentAnalytics,
  getTrafficAnalytics
} = require('../controllers/analytics');

// All routes are prefixed with /api/admin
router.get('/sales-analytics', protect, admin, getSalesAnalytics);
router.get('/top-products', protect, admin, getTopProducts);
router.get('/payment-analytics', protect, admin, getPaymentAnalytics);
router.get('/traffic-analytics', protect, admin, getTrafficAnalytics);

module.exports = router;