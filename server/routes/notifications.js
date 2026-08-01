const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getNotifications,
  getNotificationCounts,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notifications');

// Apply authentication and admin middleware to all routes
router.use(protect);
router.use(adminOnly);

// Get all notifications
router.get('/', getNotifications);

// Get notification counts
router.get('/counts', getNotificationCounts);

// Mark notification as read
router.patch('/:id/read', markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

module.exports = router;