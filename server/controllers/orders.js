const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const DiscountCode = require('../models/DiscountCode');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      discountCode,
      discountAmount
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items'
      });
    }

    // Validate products and calculate actual prices
    let calculatedItemsPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      // Check stock
      const variant = product.variants.find(v => 
        v.size === item.size && v.color === item.color
      );
      
      if (!variant || variant.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      const itemTotal = product.price * item.quantity;
      calculatedItemsPrice += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url || '/api/placeholder/150/150',
        price: product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        subtotal: itemTotal
      });
    }

    // Generate order number
    const orderNumber = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);

    // Validate discount code if provided
    let validatedDiscountAmount = 0;
    if (discountCode) {
      const discountCodeDoc = await DiscountCode.findOne({ 
        code: discountCode.toUpperCase(),
        isActive: true
      });
      
      if (discountCodeDoc) {
        const validation = discountCodeDoc.isValidForUser(req.user.id);
        if (validation.valid && calculatedItemsPrice >= discountCodeDoc.minimumOrderAmount) {
          validatedDiscountAmount = discountCodeDoc.calculateDiscount(calculatedItemsPrice);
          
          // Update discount code usage
          const userUsage = discountCodeDoc.usedBy.find(usage => 
            usage.user.toString() === req.user.id.toString()
          );
          
          if (userUsage) {
            userUsage.usedCount += 1;
            userUsage.lastUsed = new Date();
          } else {
            discountCodeDoc.usedBy.push({
              user: req.user.id,
              usedCount: 1,
              lastUsed: new Date()
            });
          }
          
          discountCodeDoc.usedCount += 1;
          await discountCodeDoc.save();
        }
      }
    }

    // Create order
    const order = await Order.create({
      user: req.user.id,
      orderNumber,
      items: orderItems,
      shippingAddress,
      paymentInfo: {
        method: paymentMethod,
        status: paymentMethod === 'cod' ? 'pending' : 'pending'
      },
      itemsPrice: calculatedItemsPrice,
      taxPrice: taxPrice || 0,
      shippingPrice: shippingPrice || 0,
      discountAmount: validatedDiscountAmount,
      discountCode: discountCode || null,
      totalPrice: calculatedItemsPrice + (taxPrice || 0) + (shippingPrice || 0) - validatedDiscountAmount,
      orderStatus: 'pending'
    });

    // If Razorpay payment, create Razorpay order
    if (paymentMethod === 'razorpay') {
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(order.totalPrice * 100), // Amount in paise
        currency: 'INR',
        receipt: order.orderNumber,
        notes: {
          orderId: order._id.toString(),
          userId: req.user.id.toString()
        }
      });

      order.paymentInfo.razorpayOrderId = razorpayOrder.id;
      await order.save();

      return res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order,
        razorpayOrder: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency
        }
      });
    }

    // For COD orders, update stock immediately
    for (const item of items) {
      await Product.findOneAndUpdate(
        { 
          _id: item.product,
          'variants.size': item.size,
          'variants.color': item.color
        },
        { 
          $inc: { 
            'variants.$.stock': -item.quantity,
            soldCount: item.quantity
          }
        }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating order'
    });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/orders/verify-payment
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Update order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.paymentInfo.status = 'completed';
    order.paymentInfo.razorpayPaymentId = razorpay_payment_id;
    order.paymentInfo.razorpaySignature = razorpay_signature;
    order.paymentInfo.paidAt = new Date();
    order.orderStatus = 'confirmed';

    await order.save();

    // Update product stock
    for (const item of order.items) {
      await Product.findOneAndUpdate(
        { 
          _id: item.product,
          'variants.size': item.size,
          'variants.color': item.color
        },
        { 
          $inc: { 
            'variants.$.stock': -item.quantity,
            soldCount: item.quantity
          }
        }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      order
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying payment'
    });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = { user: req.user.id };
    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('items.product', 'name slug images')
      .select('-paymentInfo.razorpaySignature');

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      orders
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    })
      .populate('items.product', 'name slug images')
      .select('-paymentInfo.razorpaySignature');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order'
    });
  }
};

// @desc    Apply coupon code
// @route   POST /api/orders/apply-coupon
// @access  Private
exports.applyCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    const discountCode = await DiscountCode.findOne({ 
      code: code.toUpperCase(),
      isActive: true
    });

    if (!discountCode) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    // Check if coupon is valid for user
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
        message: `Minimum order amount is ?${discountCode.minimumOrderAmount}`
      });
    }

    // Calculate discount
    const discountAmount = discountCode.calculateDiscount(orderAmount);

    res.status(200).json({
      success: true,
      discountAmount,
      message: 'Coupon applied successfully'
    });

  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while applying coupon'
    });
  }
};



// @desc    Initialize Razorpay payment
// @route   POST /api/orders/init-payment
// @access  Private
exports.initPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Generate payment page HTML with server-side key
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Payment - StyleHub</title>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </head>
    <body>
        <script>
        const options = {
            key: '${process.env.RAZORPAY_KEY_ID}',
            amount: ${order.totalPrice * 100},
            currency: 'INR',
            name: 'StyleHub',
            description: 'Order #${order.orderNumber}',
            order_id: '${order.paymentInfo.razorpayOrderId}',
            handler: function(response) {
                fetch('/api/orders/verify-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ${req.headers.authorization?.split(' ')[1]}'
                    },
                    body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        orderId: '${order._id}'
                    })
                }).then(res => res.json()).then(data => {
                    if (data.success) {
                        window.location.href = '/orders/${order._id}?success=true';
                    } else {
                        alert('Payment verification failed');
                    }
                });
            },
            prefill: {
                name: '${order.shippingAddress.fullName}',
                email: '${req.user.email}',
                contact: '${order.shippingAddress.phone}'
            },
            theme: {
                color: '#2563eb'
            }
        };
        
        const rzp = new Razorpay(options);
        rzp.open();
        
        rzp.on('payment.failed', function(response) {
            alert('Payment failed: ' + response.error.description);
            window.location.href = '/checkout';
        });
        </script>
    </body>
    </html>`;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
    
  } catch (error) {
    console.error('Init payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create test discount code (for development)
// @route   POST /api/orders/create-test-coupon
// @access  Public (for testing only)
exports.createTestCoupon = async (req, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        success: false,
        message: 'Not allowed in production'
      });
    }

    // Check if test coupon already exists
    const existingCoupon = await DiscountCode.findOne({ code: 'TEST10' });
    if (existingCoupon) {
      return res.status(200).json({
        success: true,
        message: 'Test coupon already exists: TEST10 - 10% off orders above ?100'
      });
    }

    // Use the requesting user as creator (must be admin to access this)
    const User = require('../models/User');
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      // Create a default admin if none exists
      adminUser = await User.create({
        name: 'Admin',
        email: 'admin@stylehub.com',
        password: 'admin123',
        role: 'admin'
      });
    }

    const testCoupon = await DiscountCode.create({
      code: 'TEST10',
      description: 'Test discount code - 10% off',
      type: 'percentage',
      value: 10,
      minimumOrderAmount: 100,
      maximumDiscountAmount: 500,
      usageLimit: 100,
      userUsageLimit: 1,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isActive: true,
      createdBy: adminUser._id
    });

    res.status(201).json({
      success: true,
      message: 'Test coupon created: TEST10 - 10% off orders above ?100 (valid for 30 days)'
    });
  } catch (error) {
    console.error('Create test coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Cancel order
// @route   PATCH /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    order.orderStatus = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason || 'Cancelled by user';
    
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findOneAndUpdate(
        { 
          _id: item.product,
          'variants.size': item.size,
          'variants.color': item.color
        },
        { 
          $inc: { 
            'variants.$.stock': item.quantity,
            soldCount: -item.quantity
          }
        }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling order'
    });
  }
};