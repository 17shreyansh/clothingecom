import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, FiPackage, FiShoppingBag, FiUsers, FiTag, 
  FiPercent, FiMenu, FiX, FiLogOut, FiSettings,
  FiBarChart, FiLayout, FiMail, FiMessageSquare, FiBell
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import './AdminLayout.css';

function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { counts, notifications, fetchNotifications, markAsRead } = useNotifications();
  
  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const menuItems = [
    { path: '/admin', icon: FiHome, label: 'Dashboard', exact: true },
    { path: '/admin/products', icon: FiPackage, label: 'Products' },
    { 
      path: '/admin/orders', 
      icon: FiShoppingBag, 
      label: 'Orders',
      count: counts.orders
    },
    { path: '/admin/users', icon: FiUsers, label: 'Users' },
    { path: '/admin/categories', icon: FiTag, label: 'Categories' },
    { path: '/admin/discounts', icon: FiPercent, label: 'Discounts' },
    { path: '/admin/homepage', icon: FiLayout, label: 'Homepage Editor' },
    { path: '/admin/email-settings', icon: FiMail, label: 'Email Settings' },
    { 
      path: '/admin/contacts', 
      icon: FiMessageSquare, 
      label: 'Contact Leads',
      count: counts.leads
    },
    { 
      path: '/admin/notifications', 
      icon: FiBell, 
      label: 'Notifications',
      count: counts.total
    },
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="admin-layout">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="admin-logo">
            <FiBarChart />
            <span>StyleHub Admin</span>
          </div>
          <button 
            className="sidebar-close lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-link ${isActive(item.path, item.exact) ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon />
                  <span>{item.label}</span>
                  {item.count > 0 && (
                    <span className="nav-badge">{item.count}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-user">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">Administrator</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Bar */}
        <header className="admin-header">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
          >
            <FiMenu />
          </button>
          
          <div className="header-title">
            <h1>Admin Panel</h1>
          </div>

          <div className="header-actions">
            <div className="notification-dropdown">
              <button 
                className="notification-btn"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) {
                    fetchNotifications({ limit: 10 });
                  }
                }}
              >
                <FiBell />
                {counts.total > 0 && (
                  <span className="notification-badge">{counts.total}</span>
                )}
              </button>
              
              {showNotifications && (
                <div className="notification-panel">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                    <span className="notification-count">{counts.total} unread</span>
                  </div>
                  <div className="notification-list">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map(notification => (
                        <div 
                          key={notification._id} 
                          className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                          onClick={() => markAsRead(notification._id)}
                        >
                          <div className="notification-content">
                            <h4>{notification.title}</h4>
                            <p>{notification.message}</p>
                            <span className="notification-time">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-notifications">
                        <p>No notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="admin-user-header">
              <div className="user-avatar">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;