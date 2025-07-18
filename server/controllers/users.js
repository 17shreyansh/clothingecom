const DiscountCode = require('../models/DiscountCode');

// @desc    Validate discount code
// @route   POST /api/users/validate-discount
// @access  Private
exports.validateDiscountCode = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Discount code is required'
      });
    }

    const discountCode = await DiscountCode.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    });

    if (!discountCode) {
      return res.status(404).json({
        success: false,
        message: 'Invalid discount code'
      });
    }

    // Validate code for user
    const validation = discountCode.isValidForUser(req.user.id);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.reason
      });
    }

    // Check minimum order amount
    if (orderAmount < discountCode.minimumOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${discountCode.minimumOrderAmount} required`
      });
    }

    // Calculate discount
    const discountAmount = discountCode.calculateDiscount(orderAmount);

    res.status(200).json({
      success: true,
      message: 'Discount code is valid',
      discount: {
        code: discountCode.code,
        type: discountCode.type,
        value: discountCode.value,
        discountAmount,
        description: discountCode.description
      }
    });
  } catch (error) {
    console.error('Validate discount code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while validating discount code'
    });
  }
};

// @desc    Contact us form submission
// @route   POST /api/users/contact
// @access  Public
exports.contactUs = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required'
      });
    }

    // In a real application, you would:
    // 1. Save to database
    // 2. Send email notification to admin
    // 3. Send confirmation email to user
    
    // For now, we'll just log and return success
    console.log('Contact form submission:', {
      name,
      email,
      phone,
      subject,
      message,
      timestamp: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Thank you for your message. We will get back to you soon!'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing contact form'
    });
  }
};