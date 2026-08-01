const Notification = require('../models/Notification');

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private/Admin
exports.getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type;
    const isRead = req.query.isRead;

    let query = {};
    if (type) query.type = type;
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const notifications = await Notification.find(query)
      .populate('relatedId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalNotifications = await Notification.countDocuments(query);
    const totalPages = Math.ceil(totalNotifications / limit);

    res.status(200).json({
      success: true,
      notifications,
      totalPages,
      currentPage: page,
      totalNotifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get notification counts
// @route   GET /api/notifications/counts
// @access  Private/Admin
exports.getNotificationCounts = async (req, res) => {
  try {
    const [
      totalUnread,
      orderNotifications,
      leadNotifications,
      userNotifications,
      systemNotifications
    ] = await Promise.all([
      Notification.countDocuments({ isRead: false }),
      Notification.countDocuments({ type: 'order', isRead: false }),
      Notification.countDocuments({ type: 'lead', isRead: false }),
      Notification.countDocuments({ type: 'user', isRead: false }),
      Notification.countDocuments({ type: 'system', isRead: false })
    ]);

    res.status(200).json({
      success: true,
      counts: {
        total: totalUnread,
        orders: orderNotifications,
        leads: leadNotifications,
        users: userNotifications,
        system: systemNotifications
      }
    });
  } catch (error) {
    console.error('Get notification counts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private/Admin
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/mark-all-read
// @access  Private/Admin
exports.markAllAsRead = async (req, res) => {
  try {
    const { type } = req.body;
    let query = { isRead: false };
    
    if (type) {
      query.type = type;
    }

    await Notification.updateMany(query, { isRead: true });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private/Admin
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Helper function to create notifications
exports.createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};