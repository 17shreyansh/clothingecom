import React, { useState, useEffect } from 'react';
import { FiX, FiUpload, FiTrash2, FiPlus, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import api from '../services/api';
import './ProductModal.css';

const validationSchema = Yup.object({
  name: Yup.string().required('Product name is required'),
  description: Yup.string().required('Description is required'),
  price: Yup.number().min(0, 'Price must be positive').required('Price is required'),
  category: Yup.string().required('Category is required'),
  brand: Yup.string().required('Brand is required')
});

function ProductModal({ product, categories, onClose }) {
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [variants, setVariants] = useState([{ size: 'M', color: 'Black', stock: 0 }]);
  const [activeTab, setActiveTab] = useState('basic');
  const [showValidation, setShowValidation] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const isEditing = !!product;

  const formik = useFormik({
    initialValues: {
      name: product?.name || '',
      description: product?.description || '',
      shortDescription: product?.shortDescription || '',
      price: product?.price || '',
      compareAtPrice: product?.compareAtPrice || '',
      costPrice: product?.costPrice || '',
      category: product?.category?._id || '',
      subcategory: product?.subcategory?._id || '',
      brand: product?.brand || '',
      material: product?.material || '',
      careInstructions: product?.careInstructions || '',
      tags: product?.tags?.join(', ') || '',
      isFeatured: product?.isFeatured || false,
      isNewArrival: product?.isNewArrival || false,
      isActive: product?.isActive !== undefined ? product.isActive : true
    },
    validationSchema,
    onSubmit: handleSubmit
  });

  useEffect(() => {
    if (product?.variants) {
      setVariants(product.variants);
    }
    if (product?.images) {
      setExistingImages([...product.images]);
    }
  }, [product]);

  async function handleSubmit(values, { validateForm }) {
    // Validate the form first
    const errors = await validateForm(values);
    const hasErrors = Object.keys(errors).length > 0;
    
    if (hasErrors) {
      setValidationErrors(errors);
      setShowValidation(true);
      
      // Switch to the tab with the first error
      if (errors.name || errors.description || errors.brand || errors.price || errors.category) {
        setActiveTab('basic');
      } else if (errors.variants) {
        setActiveTab('variants');
      }
      
      toast.error('Please fix the validation errors before submitting');
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Add form fields
      Object.keys(values).forEach(key => {
        if (key === 'tags') {
          formData.append(key, values[key].split(',').map(tag => tag.trim()).join(','));
        } else {
          formData.append(key, values[key]);
        }
      });

      // Add variants
      formData.append('variants', JSON.stringify(variants));

      // Add images
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      // Add existing images if editing
      if (isEditing) {
        formData.append('existingImages', JSON.stringify(existingImages));
      }

      const url = isEditing ? `/admin/products/${product._id}` : '/admin/products';
      const method = isEditing ? 'put' : 'post';
      
      const response = await api[method](url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success(`Product ${isEditing ? 'updated' : 'created'} successfully`);
        onClose();
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const moveExistingImage = (fromIndex, toIndex) => {
    setExistingImages(prev => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages;
    });
  };

  const addVariant = () => {
    setVariants(prev => [...prev, { size: 'M', color: 'Black', stock: 0 }]);
  };

  const updateVariant = (index, field, value) => {
    setVariants(prev => prev.map((variant, i) => 
      i === index ? { ...variant, [field]: value } : variant
    ));
  };

  const removeVariant = (index) => {
    if (variants.length > 1) {
      setVariants(prev => prev.filter((_, i) => i !== index));
    }
  };

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42'];
  const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Brown', 'Gray', 'Navy', 'Beige'];

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div className="product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="close-btn">
            <FiX />
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Info
          </button>
          <button
            className={`tab-btn ${activeTab === 'variants' ? 'active' : ''}`}
            onClick={() => setActiveTab('variants')}
          >
            Variants
          </button>
          <button
            className={`tab-btn ${activeTab === 'images' ? 'active' : ''}`}
            onClick={() => setActiveTab('images')}
          >
            Images
          </button>
          <button
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>

        <form onSubmit={formik.handleSubmit} className="modal-form">
          <div className="modal-content">
            {activeTab === 'basic' && (
              <div className="tab-content">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      className={`form-input ${formik.touched.name && formik.errors.name ? 'error' : ''}`}
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter product name (max 100 characters)"
                    />
                    <small className="form-help">Required. Maximum 100 characters.</small>
                    {formik.touched.name && formik.errors.name && (
                      <div className="form-error">{formik.errors.name}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Brand *</label>
                    <input
                      type="text"
                      name="brand"
                      className={`form-input ${formik.touched.brand && formik.errors.brand ? 'error' : ''}`}
                      value={formik.values.brand}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.brand && formik.errors.brand && (
                      <div className="form-error">{formik.errors.brand}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      name="category"
                      className={`form-select ${formik.touched.category && formik.errors.category ? 'error' : ''}`}
                      value={formik.values.category}
                      onChange={(e) => {
                        if (e.target.value === 'create-new') {
                          window.location.href = '/admin/categories';
                          return;
                        }
                        formik.handleChange(e);
                      }}
                      onBlur={formik.handleBlur}
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                      <option value="create-new" disabled>--------------</option>
                      <option value="create-new">Create New Category</option>
                    </select>
                    {formik.touched.category && formik.errors.category && (
                      <div className="form-error">{formik.errors.category}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Material</label>
                    <input
                      type="text"
                      name="material"
                      className="form-input"
                      value={formik.values.material}
                      onChange={formik.handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Price *</label>
                    <input
                      type="number"
                      name="price"
                      className={`form-input ${formik.touched.price && formik.errors.price ? 'error' : ''}`}
                      value={formik.values.price}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.price && formik.errors.price && (
                      <div className="form-error">{formik.errors.price}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Compare At Price</label>
                    <input
                      type="number"
                      name="compareAtPrice"
                      className="form-input"
                      value={formik.values.compareAtPrice}
                      onChange={formik.handleChange}
                      placeholder="Original price for discount display"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cost Price</label>
                    <input
                      type="number"
                      name="costPrice"
                      className="form-input"
                      value={formik.values.costPrice}
                      onChange={formik.handleChange}
                      placeholder="Your cost for profit calculation"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tags</label>
                    <input
                      type="text"
                      name="tags"
                      className="form-input"
                      placeholder="Comma separated tags"
                      value={formik.values.tags}
                      onChange={formik.handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Short Description</label>
                  <textarea
                    name="shortDescription"
                    className="form-textarea"
                    rows="3"
                    value={formik.values.shortDescription}
                    onChange={formik.handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    name="description"
                    className={`form-textarea ${formik.touched.description && formik.errors.description ? 'error' : ''}`}
                    rows="5"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.description && formik.errors.description && (
                    <div className="form-error">{formik.errors.description}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Care Instructions</label>
                  <textarea
                    name="careInstructions"
                    className="form-textarea"
                    rows="3"
                    value={formik.values.careInstructions}
                    onChange={formik.handleChange}
                  />
                </div>
              </div>
            )}

            {activeTab === 'variants' && (
              <div className="tab-content">
                <div className="variants-header">
                  <h3>Product Variants</h3>
                  <button type="button" onClick={addVariant} className="btn btn-outline btn-sm">
                    <FiPlus />
                    Add Variant
                  </button>
                </div>

                <div className="variants-list">
                  {variants.map((variant, index) => (
                    <div key={index} className="variant-item">
                      <div className="variant-fields">
                        <div className="form-group">
                          <label className="form-label">Size</label>
                          <select
                            value={variant.size}
                            onChange={(e) => updateVariant(index, 'size', e.target.value)}
                            className="form-select"
                          >
                            {sizes.map(size => (
                              <option key={size} value={size}>{size}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Color</label>
                          <select
                            value={variant.color}
                            onChange={(e) => updateVariant(index, 'color', e.target.value)}
                            className="form-select"
                          >
                            {colors.map(color => (
                              <option key={color} value={color}>{color}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Stock</label>
                          <input
                            type="number"
                            value={variant.stock}
                            onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                            className="form-input"
                            min="0"
                          />
                        </div>
                      </div>

                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="remove-variant-btn"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'images' && (
              <div className="tab-content">
                <div className="image-upload-section">
                  <h3>Product Images</h3>
                  
                  <div className="image-upload">
                    <input
                      type="file"
                      id="images"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file-input"
                    />
                    <label htmlFor="images" className="upload-label">
                      <FiUpload />
                      <span>Upload Images</span>
                      <small>PNG, JPG, WEBP up to 5MB each</small>
                    </label>
                  </div>

                  {imageFiles.length > 0 && (
                    <div className="image-preview">
                      <h4>New Images</h4>
                      <div className="image-grid">
                        {imageFiles.map((file, index) => (
                          <div key={index} className="image-item">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="remove-image-btn"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isEditing && existingImages.length > 0 && (
                    <div className="existing-images">
                      <h4>Existing Images</h4>
                      <div className="image-grid">
                        {existingImages.map((image, index) => (
                          <div key={index} className="image-item">
                            <img src={image.url} alt={`Product ${index + 1}`} />
                            <div className="image-controls">
                              <button
                                type="button"
                                onClick={() => moveExistingImage(index, Math.max(0, index - 1))}
                                disabled={index === 0}
                                className="move-btn"
                                title="Move up"
                              >
                                ?
                              </button>
                              <button
                                type="button"
                                onClick={() => moveExistingImage(index, Math.min(existingImages.length - 1, index + 1))}
                                disabled={index === existingImages.length - 1}
                                className="move-btn"
                                title="Move down"
                              >
                                ?
                              </button>
                              <button
                                type="button"
                                onClick={() => removeExistingImage(index)}
                                className="remove-image-btn"
                                title="Remove image"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="tab-content">
                <div className="settings-grid">
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={formik.values.isFeatured}
                        onChange={formik.handleChange}
                      />
                      <span>Featured Product</span>
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="isNewArrival"
                        checked={formik.values.isNewArrival}
                        onChange={formik.handleChange}
                      />
                      <span>New Arrival</span>
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formik.values.isActive}
                        onChange={formik.handleChange}
                      />
                      <span>Active Product</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
            {/* Validation Sidebar */}
            <div className={`validation-sidebar ${showValidation ? 'show' : ''}`}>
              <h4>Required Fields</h4>
              {validationErrors.name && (
                <div className="validation-item error">
                  <h5>Product Name</h5>
                  <p>{validationErrors.name}</p>
                </div>
              )}
              {validationErrors.brand && (
                <div className="validation-item error">
                  <h5>Brand</h5>
                  <p>{validationErrors.brand}</p>
                </div>
              )}
              {validationErrors.category && (
                <div className="validation-item error">
                  <h5>Category</h5>
                  <p>{validationErrors.category}</p>
                </div>
              )}
              {validationErrors.price && (
                <div className="validation-item error">
                  <h5>Price</h5>
                  <p>{validationErrors.price}</p>
                </div>
              )}
              {validationErrors.description && (
                <div className="validation-item error">
                  <h5>Description</h5>
                  <p>{validationErrors.description}</p>
                </div>
              )}
              {validationErrors.shortDescription && (
                <div className="validation-item error">
                  <h5>Short Description</h5>
                  <p>{validationErrors.shortDescription}</p>
                </div>
              )}
              {!validationErrors.name && !validationErrors.brand && !validationErrors.category && 
               !validationErrors.price && !validationErrors.description && !validationErrors.shortDescription && (
                <div className="validation-item">
                  <p>All required fields are filled correctly.</p>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              onClick={() => setShowValidation(!showValidation)} 
              className="btn btn-outline"
            >
              {showValidation ? 'Hide Validation' : 'Show Validation'}
            </button>
            <div style={{ flex: 1 }}></div>
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductModal;