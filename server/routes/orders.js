const express = require('express');
const {
  createOrder,
  verifyPayment,
  applyCoupon,
  getUserOrders,
  getOrderById,
  cancelOrder,
  createTestCoupon,
  initPayment
} = require('../controllers/orders');
const { protect, admin } = require('../middleware/auth');
const Order = require('../models/Order');

const router = express.Router();

// Public routes (development only)
router.post('/create-test-coupon', createTestCoupon);

// All routes below are protected
router.use(protect);

router.post('/init-payment', initPayment);

router.post('/', createOrder);
router.post('/verify-payment', verifyPayment);
router.post('/apply-coupon', applyCoupon);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);
router.patch('/:id/cancel', cancelOrder);

// Admin only route for packing time
router.patch('/:id/packing', admin, async (req, res) => {
  try {
    const { packingTimeDays, packingStartDate, packingMessage } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        packingTimeDays,
        packingStartDate,
        packingMessage
      },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;