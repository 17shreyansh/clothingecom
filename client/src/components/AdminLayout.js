import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, FiPackage, FiShoppingBag, FiUsers, FiTag, 
  FiPercent, FiMenu, FiX, FiLogOut, FiSettings,
  FiBarChart, FiLayout, FiMail, FiMessageSquare
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  const menuItems = [
    { path: '/admin', icon: FiHome, label: 'Dashboard', exact: true },
    { path: '/admin/products', icon: FiPackage, label: 'Products' },
    { path: '/admin/orders', icon: FiShoppingBag, label: 'Orders' },
    { path: '/admin/users', icon: FiUsers, label: 'Users' },
    { path: '/admin/categories', icon: FiTag, label: 'Categories' },
    { path: '/admin/discounts', icon: FiPercent, label: 'Discounts' },
    { path: '/admin/homepage', icon: FiLayout, label: 'Homepage Editor' },
    { path: '/admin/email-settings', icon: FiMail, label: 'Email Settings' },
    { path: '/admin/contacts', icon: FiMessageSquare, label: 'Contact Management' },
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
            <button className="header-btn">
              <FiSettings />
            </button>
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