const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const Order = require('../models/Order');

// Update order packing time
router.patch('/:id/packing', protect, admin, async (req, res) => {
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