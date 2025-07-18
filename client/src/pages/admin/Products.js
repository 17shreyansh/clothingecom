import React, { useState, useEffect } from 'react';
import { 
  FiPlus, FiSearch, FiEdit3, FiTrash2, 
  FiEye, FiMoreVertical, FiImage, FiToggleLeft, FiToggleRight 
} from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';
import ProductModal from '../../components/ProductModal';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './Products.css';

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, selectedCategory, selectedStatus]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        category: selectedCategory,
        status: selectedStatus
      };
      
      const response = await api.get('/admin/products', { params });
      if (response.data.success) {
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await api.delete(`/admin/products/${productId}`);
      if (response.data.success) {
        toast.success('Product deleted successfully');
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    try {
      const response = await api.patch(`/admin/products/${productId}`, {
        isActive: !currentStatus
      });
      if (response.data.success) {
        toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchProducts();
      }
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error('Failed to update product status');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category?._id === selectedCategory;
    const matchesStatus = selectedStatus === '' || 
      (selectedStatus === 'active' && product.isActive) ||
      (selectedStatus === 'inactive' && !product.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="products-admin">
        <div className="products-header">
          <div>
            <h1>Products Management</h1>
            <p>Manage your product catalog</p>
          </div>
          <button onClick={handleAddProduct} className="btn btn-primary">
            <FiPlus />
            Add Product
          </button>
        </div>

        {/* Filters */}
        <div className="products-filters">
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Products Table */}
        <div className="products-table-container">
          {loading ? (
            <div className="table-loading">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton table-row-skeleton"></div>
              ))}
            </div>
          ) : (
            <div className="products-table">
              <div className="table-header">
                <span>Product</span>
                <span>Category</span>
                <span>Price</span>
                <span>Stock</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <div key={product._id} className="table-row">
                    <div className="product-cell">
                      <div className="product-image">
                        {product.images?.[0]?.url ? (
                          <img 
                            src={product.images[0].url} 
                            alt={product.name}
                          />
                        ) : (
                          <div className="no-image">
                            <FiImage />
                          </div>
                        )}
                      </div>
                      <div className="product-info">
                        <h4>{product.name}</h4>
                        <p>{product.brand}</p>
                      </div>
                    </div>
                    
                    <span className="category-cell">
                      {product.category?.name || 'Uncategorized'}
                    </span>
                    
                    <span className="price-cell">
                      ₹{product.price}
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="discount">-{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%</span>
                      )}
                    </span>
                    
                    <span className="stock-cell">
                      <span className={`stock-badge ${product.totalStock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {product.totalStock || 0}
                      </span>
                    </span>
                    
                    <span className="status-cell">
                      <button
                        onClick={() => handleToggleStatus(product._id, product.isActive)}
                        className={`status-toggle ${product.isActive ? 'active' : 'inactive'}`}
                      >
                        {product.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                        {product.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </span>
                    
                    <div className="actions-cell">
                      <button 
                        onClick={() => handleEditProduct(product)}
                        className="btn btn-outline btn-sm"
                        style={{ marginRight: '0.5rem' }}
                      >
                        <FiEdit3 />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product._id)}
                        className="btn btn-outline btn-sm btn-danger"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <FiImage />
                  <h3>No products found</h3>
                  <p>Try adjusting your search or filters</p>
                  <button onClick={handleAddProduct} className="btn btn-primary">
                    Add Your First Product
                  </button>
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

        {/* Product Modal */}
        {showModal && (
          <ProductModal
            product={editingProduct}
            categories={categories}
            onClose={handleModalClose}
          />
        )}
      </div>
    </AdminLayout>
  );
}

export default Products;