const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const DiscountCode = require('../models/DiscountCode');

// Initialize Razorpay only if keys are provided
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && 
    process.env.RAZORPAY_KEY_ID !== 'your-razorpay-key-id') {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
exports.createRazorpayOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      discountCode
    } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate shipping address for prepaid orders
    if (paymentMethod === 'razorpay' && !shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }

    let orderItems = [];
    let itemsPrice = 0;

    // Process each item
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      // Check variant availability
      const variant = product.variants.find(
        v => v.size === item.size && v.color === item.color
      );

      if (!variant) {
        return res.status(400).json({
          success: false,
          message: `Variant not available for ${product.name}`
        });
      }

      if (variant.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name} (${item.size}, ${item.color})`
        });
      }

      const itemPrice = product.price * item.quantity;
      itemsPrice += itemPrice;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url || '',
        price: product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        subtotal: itemPrice
      });
    }

    // Apply discount if provided
    let discountAmount = 0;
    let discountInfo = null;

    if (discountCode) {
      const discount = await DiscountCode.findOne({ 
        code: discountCode.toUpperCase(),
        isActive: true 
      });

      if (discount) {
        const validation = discount.isValidForUser(req.user.id);
        if (validation.valid) {
          if (itemsPrice >= discount.minimumOrderAmount) {
            discountAmount = discount.calculateDiscount(itemsPrice);
            discountInfo = {
              code: discount.code,
              discountAmount
            };
          }
        }
      }
    }

    // Calculate totals
    const shippingPrice = itemsPrice >= 500 ? 0 : 50; // Free shipping above ₹500
    const taxPrice = Math.round((itemsPrice - discountAmount) * 0.18); // 18% GST
    const totalPrice = itemsPrice + shippingPrice + taxPrice - discountAmount;

    // Create order in database
    const orderData = {
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      itemsPrice,
      shippingPrice,
      taxPrice,
      discountAmount,
      totalPrice,
      paymentInfo: {
        method: paymentMethod,
        status: paymentMethod === 'cod' ? 'completed' : 'pending'
      }
    };

    if (discountInfo) {
      orderData.discountCode = discountInfo;
    }

    const order = await Order.create(orderData);

    // For COD orders, complete immediately
    if (paymentMethod === 'cod') {
      // Update product stock
      for (const item of items) {
        const product = await Product.findById(item.product);
        const variantIndex = product.variants.findIndex(
          v => v.size === item.size && v.color === item.color
        );
        
        if (variantIndex !== -1) {
          product.variants[variantIndex].stock -= item.quantity;
          product.soldCount += item.quantity;
          await product.save();
        }
      }

      // Update discount code usage
      if (discountCode && discountInfo) {
        await updateDiscountUsage(discountCode, req.user.id);
      }

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          totalPrice: order.totalPrice,
          paymentMethod: 'cod'
        }
      });
    }

    // For Razorpay orders, create Razorpay order
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: 'Payment gateway not configured. Please contact support.'
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalPrice * 100), // Amount in paise
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order._id.toString(),
        userId: req.user.id
      }
    });

    // Update order with Razorpay order ID
    order.paymentInfo.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        totalPrice: order.totalPrice
      },
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID
      }
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
// @route   POST /api/payments/verify
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

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
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

    order.paymentInfo.razorpayPaymentId = razorpay_payment_id;
    order.paymentInfo.razorpaySignature = razorpay_signature;
    order.paymentInfo.status = 'completed';
    order.paymentInfo.paidAt = new Date();
    await order.save();

    // Update product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        const variantIndex = product.variants.findIndex(
          v => v.size === item.size && v.color === item.color
        );
        
        if (variantIndex !== -1) {
          product.variants[variantIndex].stock -= item.quantity;
          product.soldCount += item.quantity;
          await product.save();
        }
      }
    }

    // Update discount code usage
    if (order.discountCode && order.discountCode.code) {
      await updateDiscountUsage(order.discountCode.code, order.user);
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        totalPrice: order.totalPrice,
        paymentStatus: order.paymentInfo.status
      }
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during payment verification'
    });
  }
};

// @desc    Razorpay webhook
// @route   POST /api/payments/webhook
// @access  Public (Razorpay webhook)
exports.razorpayWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (webhookSignature !== expectedSignature) {
        return res.status(400).json({ success: false, message: 'Invalid signature' });
      }
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload.payment.entity;

    if (event === 'payment.captured') {
      // Payment successful
      const order = await Order.findOne({
        'paymentInfo.razorpayOrderId': paymentEntity.order_id
      });

      if (order && order.paymentInfo.status !== 'completed') {
        order.paymentInfo.status = 'completed';
        order.paymentInfo.paidAt = new Date();
        await order.save();
      }
    } else if (event === 'payment.failed') {
      // Payment failed
      const order = await Order.findOne({
        'paymentInfo.razorpayOrderId': paymentEntity.order_id
      });

      if (order) {
        order.paymentInfo.status = 'failed';
        order.paymentInfo.failureReason = paymentEntity.error_description;
        await order.save();
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
};

// Helper function to update discount code usage
async function updateDiscountUsage(discountCode, userId) {
  try {
    const discount = await DiscountCode.findOne({ code: discountCode.toUpperCase() });
    if (discount) {
      discount.usedCount += 1;
      
      const userUsage = discount.usedBy.find(usage => usage.user.toString() === userId.toString());
      if (userUsage) {
        userUsage.usedCount += 1;
        userUsage.lastUsed = new Date();
      } else {
        discount.usedBy.push({
          user: userId,
          usedCount: 1,
          lastUsed: new Date()
        });
      }
      
      await discount.save();
    }
  } catch (error) {
    console.error('Update discount usage error:', error);
  }
}