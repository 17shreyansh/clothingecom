import React, { createContext, useContext, useState, useEffect } from 'react';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    orders: 0,
    leads: 0,
    users: 0,
    system: 0
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Fetch notification counts
  const fetchCounts = async () => {
    if (!user || user.role !== 'admin') return;
    
    try {
      const response = await notificationService.getNotificationCounts();
      if (response.success) {
        setCounts(response.counts);
      }
    } catch (error) {
      console.error('Error fetching notification counts:', error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async (params = {}) => {
    if (!user || user.role !== 'admin') return;
    
    setLoading(true);
    try {
      const response = await notificationService.getNotifications(params);
      if (response.success) {
        setNotifications(response.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
      // Refresh counts
      fetchCounts();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async (type = null) => {
    try {
      await notificationService.markAllAsRead(type);
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          !type || notif.type === type 
            ? { ...notif, isRead: true }
            : notif
        )
      );
      // Refresh counts
      fetchCounts();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      // Update local state
      setNotifications(prev => 
        prev.filter(notif => notif._id !== notificationId)
      );
      // Refresh counts
      fetchCounts();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Auto-refresh counts every 30 seconds for admin users
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchCounts();
      const interval = setInterval(fetchCounts, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const value = {
    notifications,
    counts,
    loading,
    fetchNotifications,
    fetchCounts,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};