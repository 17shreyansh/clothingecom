import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiSearch, FiEye, FiEdit3, FiPackage, 
  FiTruck, FiCheck, FiX, FiClock, FiMoreVertical 
} from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';
import OrderDetailModal from '../../components/OrderDetailModal';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './Orders.css';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const statusOptions = [
    { value: '', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'packed', label: 'Packed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, selectedStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: selectedStatus
      };
      
      const response = await api.get('/admin/orders', { params });
      if (response.data.success) {
        setOrders(response.data.orders);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const response = await api.get(`/admin/orders/${orderId}`);
      if (response.data.success) {
        setSelectedOrder(response.data.order);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to fetch order details');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await api.patch(`/admin/orders/${orderId}/status`, {
        status: newStatus
      });
      if (response.data.success) {
        toast.success('Order status updated successfully');
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock />;
      case 'confirmed': return <FiCheck />;
      case 'packed': return <FiPackage />;
      case 'shipped': return <FiTruck />;
      case 'delivered': return <FiCheck />;
      case 'cancelled': return <FiX />;
      default: return <FiClock />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'packed': return 'primary';
      case 'shipped': return 'success';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'warning';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !selectedStatus || order.orderStatus === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="orders-admin">
        <div className="orders-header">
          <div>
            <h1>Orders Management</h1>
            <p>Manage and track customer orders</p>
          </div>
          <div className="orders-stats">
            <div className="stat-item">
              <span className="stat-value">{orders.length}</span>
              <span className="stat-label">Total Orders</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {orders.filter(o => o.orderStatus === 'pending').length}
              </span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="orders-filters">
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Search orders, customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="filter-select"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Orders Table */}
        <div className="orders-table-container">
          {loading ? (
            <div className="table-loading">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton table-row-skeleton"></div>
              ))}
            </div>
          ) : (
            <div className="orders-table">
              <div className="table-header">
                <span>Order</span>
                <span>Customer</span>
                <span>Items</span>
                <span>Total</span>
                <span>Status</span>
                <span>Date</span>
                <span>Actions</span>
              </div>
              
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <div key={order._id} className="table-row">
                    <div className="order-cell">
                      <div className="order-info">
                        <h4>#{order.orderNumber}</h4>
                        <p>{order.paymentInfo.method === 'cod' ? 'COD' : 'Online'}</p>
                      </div>
                    </div>
                    
                    <div className="customer-cell">
                      <div className="customer-info">
                        <h4>{order.user?.name}</h4>
                        <p>{order.user?.email}</p>
                      </div>
                    </div>
                    
                    <span className="items-cell">
                      {order.items?.length || 0} items
                    </span>
                    
                    <span className="total-cell">
                      ₹{order.totalPrice?.toLocaleString()}
                    </span>
                    
                    <div className="status-cell">
                      <div className={`status-badge status-${getStatusColor(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                        <span>{order.orderStatus}</span>
                      </div>
                    </div>
                    
                    <span className="date-cell">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    
                    <div className="actions-cell">
                      <Link 
                        to={`/admin/orders/${order._id}`}
                        className="btn btn-outline btn-sm"
                      >
                        <FiEye />
                        View
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <FiPackage />
                  <h3>No orders found</h3>
                  <p>Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn btn-outline"
            >
              Previous
            </button>
            
            <div className="page-numbers">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn btn-outline"
            >
              Next
            </button>
          </div>
        )}

        {/* Order Detail Modal */}
        {showModal && selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => {
              setShowModal(false);
              setSelectedOrder(null);
              fetchOrders();
            }}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </div>
    </AdminLayout>
  );
}

export default Orders;