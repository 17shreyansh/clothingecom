import React, { useState, useEffect } from 'react';
import { 
  FiTrendingUp, FiUsers, FiPackage, FiShoppingBag, 
  FiDollarSign, FiArrowUp, FiArrowDown, FiLayout
} from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  // eslint-disable-next-line react-hooks/exhaustive-deps

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`,
      change: '+12.5%',
      trend: 'up',
      icon: FiDollarSign,
      color: 'success'
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      change: '+8.2%',
      trend: 'up',
      icon: FiShoppingBag,
      color: 'primary'
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      change: '+3.1%',
      trend: 'up',
      icon: FiPackage,
      color: 'info'
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      change: '+15.3%',
      trend: 'up',
      icon: FiUsers,
      color: 'warning'
    }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="dashboard-loading">
          <div className="stats-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton stat-card-skeleton"></div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard Overview</h1>
            <p>Welcome back! Here's what's happening with your store.</p>
          </div>
          <div className="dashboard-actions">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="time-range-select"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          {statCards.map((stat, index) => (
            <div key={index} className={`stat-card stat-card-${stat.color}`}>
              <div className="stat-header">
                <div className="stat-icon">
                  <stat.icon />
                </div>
                <div className={`stat-change ${stat.trend}`}>
                  {stat.trend === 'up' ? <FiArrowUp /> : <FiArrowDown />}
                  {stat.change}
                </div>
              </div>
              <div className="stat-content">
                <h3>{stat.value}</h3>
                <p>{stat.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts and Tables */}
        <div className="dashboard-grid">
          {/* Recent Orders */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Recent Orders</h3>
              <button className="btn btn-outline btn-sm">View All</button>
            </div>
            <div className="card-content">
              {stats?.recentOrders?.length > 0 ? (
                <div className="orders-table">
                  <div className="table-header">
                    <span>Order ID</span>
                    <span>Customer</span>
                    <span>Amount</span>
                    <span>Status</span>
                  </div>
                  {stats.recentOrders.map(order => (
                    <div key={order._id} className="table-row">
                      <span className="order-id">#{order.orderNumber}</span>
                      <span className="customer-name">{order.user?.name}</span>
                      <span className="order-amount">₹{order.totalPrice}</span>
                      <span className={`order-status status-${order.orderStatus}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FiShoppingBag />
                  <p>No recent orders</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Top Products</h3>
              <button className="btn btn-outline btn-sm">View All</button>
            </div>
            <div className="card-content">
              {stats?.topProducts?.length > 0 ? (
                <div className="products-list">
                  {stats.topProducts.map(product => (
                    <div key={product._id} className="product-item">
                      <div className="product-info">
                        <img 
                          src={product.images?.[0]?.url || '/api/placeholder/50/60'} 
                          alt={product.name}
                          className="product-image"
                        />
                        <div>
                          <h4>{product.name}</h4>
                          <p>₹{product.price}</p>
                        </div>
                      </div>
                      <div className="product-stats">
                        <span className="sold-count">{product.soldCount} sold</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FiPackage />
                  <p>No products data</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="card-content">
              <div className="quick-actions">
                <button className="quick-action-btn" onClick={() => window.location.href = '/admin/products'}>
                  <FiPackage />
                  <span>Add Product</span>
                </button>
                <button className="quick-action-btn" onClick={() => window.location.href = '/admin/users'}>
                  <FiUsers />
                  <span>View Users</span>
                </button>
                <button className="quick-action-btn" onClick={() => window.location.href = '/admin/orders'}>
                  <FiShoppingBag />
                  <span>Process Orders</span>
                </button>
                <button className="quick-action-btn" onClick={() => window.location.href = '/admin/homepage'}>
                  <FiLayout />
                  <span>Edit Homepage</span>
                </button>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>System Status</h3>
            </div>
            <div className="card-content">
              <div className="status-items">
                <div className="status-item">
                  <div className="status-indicator status-online"></div>
                  <div>
                    <h4>Server Status</h4>
                    <p>All systems operational</p>
                  </div>
                </div>
                <div className="status-item">
                  <div className="status-indicator status-online"></div>
                  <div>
                    <h4>Payment Gateway</h4>
                    <p>Razorpay connected</p>
                  </div>
                </div>
                <div className="status-item">
                  <div className="status-indicator status-online"></div>
                  <div>
                    <h4>Database</h4>
                    <p>MongoDB connected</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Dashboard;