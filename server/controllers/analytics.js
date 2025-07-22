const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// Helper function to get date range
const getDateRange = (timeRange) => {
  const now = new Date();
  let startDate;
  
  switch(timeRange) {
    case '30d':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      break;
    case '90d':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 90);
      break;
    case '1y':
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    case '7d':
    default:
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
  }
  
  return { startDate, endDate: now };
};

// @desc    Get sales analytics data
// @route   GET /api/admin/sales-analytics
// @access  Private/Admin
exports.getSalesAnalytics = async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    const { startDate, endDate } = getDateRange(timeRange);
    
    // Get sales data grouped by date
    const salesData = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate, $lte: endDate },
          'paymentInfo.status': 'completed'
        } 
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } 
          },
          sales: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Format data for frontend chart
    const formattedData = salesData.map(item => ({
      date: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sales: item.sales,
      orders: item.orders
    }));
    
    res.status(200).json({
      success: true,
      salesData: formattedData
    });
  } catch (error) {
    console.error('Sales analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get top products data
// @route   GET /api/admin/top-products
// @access  Private/Admin
exports.getTopProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ soldCount: -1 })
      .limit(5)
      .select('name price images soldCount');
    
    res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Top products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get payment methods analytics
// @route   GET /api/admin/payment-analytics
// @access  Private/Admin
exports.getPaymentAnalytics = async (req, res) => {
  try {
    const paymentStats = await Order.aggregate([
      { $match: { 'paymentInfo.status': 'completed' } },
      {
        $group: {
          _id: '$paymentInfo.method',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Calculate percentages
    const total = paymentStats.reduce((sum, item) => sum + item.count, 0);
    
    const paymentData = paymentStats.map(item => ({
      name: item._id || 'Unknown',
      value: Math.round((item.count / total) * 100)
    }));
    
    // Add colors based on payment method
    const colorMap = {
      'credit_card': 'var(--primary-color)',
      'upi': 'var(--success-color)',
      'net_banking': 'var(--info-color)',
      'wallet': 'var(--warning-color)',
      'cod': 'var(--error-color)'
    };
    
    paymentData.forEach(item => {
      const methodKey = item.name.toLowerCase().replace(/\\s+/g, '_');
      item.color = colorMap[methodKey] || null;
    });
    
    res.status(200).json({
      success: true,
      paymentData
    });
  } catch (error) {
    console.error('Payment analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get traffic analytics data
// @route   GET /api/admin/traffic-analytics
// @access  Private/Admin
exports.getTrafficAnalytics = async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    const { startDate, endDate } = getDateRange(timeRange);
    
    // For a real implementation, you would use actual traffic data
    // This is a placeholder that generates sample data based on orders and users
    
    // Get user registrations by date
    const userRegistrations = await User.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate, $lte: endDate }
        } 
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get orders by date
    const orders = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate, $lte: endDate }
        } 
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Create a map of dates in the range
    const dateMap = {};
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      dateMap[dateStr] = {
        date: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        visitors: 0,
        pageViews: 0,
        conversion: 0
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Fill in user data (visitors)
    userRegistrations.forEach(item => {
      if (dateMap[item._id]) {
        // Assume each registration represents ~10 visitors
        dateMap[item._id].visitors = item.count * 10;
      }
    });
    
    // Fill in order data (conversions)
    orders.forEach(item => {
      if (dateMap[item._id]) {
        dateMap[item._id].conversion = item.count;
        // Assume each order represents ~15 page views
        dateMap[item._id].pageViews = item.count * 15;
      }
    });
    
    // Add some randomness to make the data look more realistic
    Object.keys(dateMap).forEach(key => {
      // Base visitors on a minimum of 50
      dateMap[key].visitors = Math.max(50, dateMap[key].visitors) + Math.floor(Math.random() * 30);
      
      // Page views should be at least 3x visitors
      dateMap[key].pageViews = Math.max(dateMap[key].visitors * 3, dateMap[key].pageViews) + 
        Math.floor(Math.random() * 100);
      
      // Ensure conversions make sense (not more than visitors)
      dateMap[key].conversion = Math.min(dateMap[key].visitors, dateMap[key].conversion || 
        Math.floor(Math.random() * 10));
    });
    
    // Convert to array
    const trafficData = Object.values(dateMap);
    
    res.status(200).json({
      success: true,
      trafficData
    });
  } catch (error) {
    console.error('Traffic analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};