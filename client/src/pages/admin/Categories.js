import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit3, FiTrash2, FiTag, FiMoreVertical } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';
import CategoryModal from '../../components/CategoryModal';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './Categories.css';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/categories');
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const response = await api.delete(`/admin/categories/${categoryId}`);
      if (response.data.success) {
        toast.success('Category deleted successfully');
        fetchCategories();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingCategory(null);
    fetchCategories();
  };

  return (
    <AdminLayout>
      <div className="categories-admin">
        <div className="categories-header">
          <div>
            <h1>Categories Management</h1>
            <p>Organize your product categories</p>
          </div>
          <button onClick={handleAddCategory} className="btn btn-primary">
            <FiPlus />
            Add Category
          </button>
        </div>

        <div className="categories-grid">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="skeleton category-card-skeleton"></div>
            ))
          ) : (
            categories.map(category => (
              <div key={category._id} className="category-card">
                <div className="category-icon">
                  <FiTag />
                </div>
                <div className="category-info">
                  <h3>{category.name}</h3>
                  <p>{category.description || 'No description'}</p>
                  <div className="category-stats">
                    <span>{category.productCount || 0} products</span>
                  </div>
                </div>
                <div className="category-actions">
                  <div className="actions-dropdown">
                    <button className="actions-trigger">
                      <FiMoreVertical />
                    </button>
                    <div className="actions-menu">
                      <button onClick={() => handleEditCategory(category)}>
                        <FiEdit3 />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(category._id)}
                        className="delete-action"
                      >
                        <FiTrash2 />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {categories.length === 0 && !loading && (
          <div className="empty-state">
            <FiTag />
            <h3>No categories found</h3>
            <p>Create your first product category</p>
            <button onClick={handleAddCategory} className="btn btn-primary">
              Add Category
            </button>
          </div>
        )}

        {showModal && (
          <CategoryModal
            category={editingCategory}
            onClose={handleModalClose}
          />
        )}
      </div>
    </AdminLayout>
  );
}

export default Categories;