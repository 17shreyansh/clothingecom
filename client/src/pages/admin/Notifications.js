import React, { useState, useEffect } from 'react';
import { 
  FiBell, FiCheck, FiTrash2, FiFilter, FiRefreshCw,
  FiShoppingBag, FiMessageSquare, FiUsers, FiSettings
} from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';
import { useNotifications } from '../../context/NotificationContext';
import './Notifications.css';

function Notifications() {
  const { 
    notifications, 
    loading, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchNotifications({ 
      page, 
      limit: 20,
      type: filter !== 'all' ? filter : undefined 
    });
  }, [filter, page]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order': return FiShoppingBag;
      case 'lead': return FiMessageSquare;
      case 'user': return FiUsers;
      case 'system': return FiSettings;
      default: return FiBell;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order': return 'primary';
      case 'lead': return 'warning';
      case 'user': return 'info';
      case 'system': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInHours = (now - notificationDate) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return notificationDate.toLocaleDateString();
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <AdminLayout>
        <div className="notifications-loading">
          <div className="loading-spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="notifications-page">
        <div className="notifications-header">
          <div className="header-content">
            <h1>
              <FiBell />
              Notifications
            </h1>
            <p>Stay updated with your store activities</p>
          </div>
          
          <div className="header-actions">
            <button 
              className="btn btn-outline"
              onClick={() => fetchNotifications({ 
                page: 1, 
                limit: 20,
                type: filter !== 'all' ? filter : undefined 
              })}
            >
              <FiRefreshCw />
              Refresh
            </button>
            
            <button 
              className="btn btn-primary"
              onClick={() => markAllAsRead(filter !== 'all' ? filter : null)}
            >
              <FiCheck />
              Mark All Read
            </button>
          </div>
        </div>

        <div className="notifications-filters">
          <div className="filter-tabs">
            {[
              { key: 'all', label: 'All', icon: FiBell },
              { key: 'order', label: 'Orders', icon: FiShoppingBag },
              { key: 'lead', label: 'Leads', icon: FiMessageSquare },
              { key: 'user', label: 'Users', icon: FiUsers },
              { key: 'system', label: 'System', icon: FiSettings }
            ].map(tab => (
              <button
                key={tab.key}
                className={`filter-tab ${filter === tab.key ? 'active' : ''}`}
                onClick={() => {
                  setFilter(tab.key);
                  setPage(1);
                }}
              >
                <tab.icon />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="notifications-list">
          {notifications.length > 0 ? (
            notifications.map(notification => {
              const IconComponent = getNotificationIcon(notification.type);
              const colorClass = getNotificationColor(notification.type);
              
              return (
                <div 
                  key={notification._id} 
                  className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
                >
                  <div className={`notification-icon ${colorClass}`}>
                    <IconComponent />
                  </div>
                  
                  <div className="notification-content">
                    <div className="notification-header">
                      <h3>{notification.title}</h3>
                      <span className="notification-time">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    
                    <p className="notification-message">
                      {notification.message}
                    </p>
                    
                    {notification.data && (
                      <div className="notification-data">
                        {notification.data.orderNumber && (
                          <span className="data-tag">
                            Order: {notification.data.orderNumber}
                          </span>
                        )}
                        {notification.data.totalPrice && (
                          <span className="data-tag">
                            Amount: ₹{notification.data.totalPrice}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="notification-actions">
                    {!notification.isRead && (
                      <button
                        className="action-btn mark-read"
                        onClick={() => markAsRead(notification._id)}
                        title="Mark as read"
                      >
                        <FiCheck />
                      </button>
                    )}
                    
                    <button
                      className="action-btn delete"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this notification?')) {
                          deleteNotification(notification._id);
                        }
                      }}
                      title="Delete notification"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-notifications">
              <FiBell />
              <h3>No notifications</h3>
              <p>You're all caught up! No new notifications to show.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default Notifications;