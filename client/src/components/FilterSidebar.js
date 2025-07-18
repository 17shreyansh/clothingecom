import React, { useState } from 'react';
import { FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import './FilterSidebar.css';

function FilterSidebar({ categories, filters, onFilterChange, onClearFilters, isOpen, onClose }) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    size: true,
    color: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const priceRanges = [
    { label: 'Under ₹500', min: 0, max: 500 },
    { label: '₹500 - ₹1000', min: 500, max: 1000 },
    { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
    { label: '₹2000 - ₹5000', min: 2000, max: 5000 },
    { label: 'Above ₹5000', min: 5000, max: '' }
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Brown', 'Gray'];

  const handlePriceRangeChange = (min, max) => {
    onFilterChange('minPrice', min);
    onFilterChange('maxPrice', max);
  };

  const isFilterActive = () => {
    return filters.category || filters.minPrice || filters.maxPrice || 
           filters.size || filters.color || filters.search;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="filter-overlay" onClick={onClose}></div>
      )}

      <div className={`filter-sidebar ${isOpen ? 'filter-sidebar-open' : ''}`}>
        <div className="filter-header">
          <h3>Filters</h3>
          <div className="filter-header-actions">
            {isFilterActive() && (
              <button onClick={onClearFilters} className="clear-filters-btn">
                Clear All
              </button>
            )}
            <button className="close-filters md:hidden" onClick={onClose}>
              <FiX />
            </button>
          </div>
        </div>

        <div className="filter-content">
          {/* Categories */}
          <div className="filter-section">
            <button
              className="filter-section-header"
              onClick={() => toggleSection('categories')}
            >
              <span>Categories</span>
              {expandedSections.categories ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            
            {expandedSections.categories && (
              <div className="filter-section-content">
                <label className="filter-option">
                  <input
                    type="radio"
                    name="category"
                    value=""
                    checked={!filters.category}
                    onChange={() => onFilterChange('category', '')}
                  />
                  <span>All Categories</span>
                </label>
                {categories.map(category => (
                  <label key={category._id} className="filter-option">
                    <input
                      type="radio"
                      name="category"
                      value={category.slug}
                      checked={filters.category === category.slug}
                      onChange={() => onFilterChange('category', category.slug)}
                    />
                    <span>{category.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Price Range */}
          <div className="filter-section">
            <button
              className="filter-section-header"
              onClick={() => toggleSection('price')}
            >
              <span>Price Range</span>
              {expandedSections.price ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            
            {expandedSections.price && (
              <div className="filter-section-content">
                {priceRanges.map((range, index) => (
                  <label key={index} className="filter-option">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={filters.minPrice === range.min && filters.maxPrice === range.max}
                      onChange={() => handlePriceRangeChange(range.min, range.max)}
                    />
                    <span>{range.label}</span>
                  </label>
                ))}
                
                <div className="custom-price-range">
                  <div className="price-inputs">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => onFilterChange('minPrice', e.target.value)}
                      className="price-input"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                      className="price-input"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Size */}
          <div className="filter-section">
            <button
              className="filter-section-header"
              onClick={() => toggleSection('size')}
            >
              <span>Size</span>
              {expandedSections.size ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            
            {expandedSections.size && (
              <div className="filter-section-content">
                <div className="size-options">
                  {sizes.map(size => (
                    <button
                      key={size}
                      className={`size-option ${filters.size === size ? 'active' : ''}`}
                      onClick={() => onFilterChange('size', filters.size === size ? '' : size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Color */}
          <div className="filter-section">
            <button
              className="filter-section-header"
              onClick={() => toggleSection('color')}
            >
              <span>Color</span>
              {expandedSections.color ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            
            {expandedSections.color && (
              <div className="filter-section-content">
                <div className="color-options">
                  {colors.map(color => (
                    <button
                      key={color}
                      className={`color-option ${filters.color === color ? 'active' : ''}`}
                      onClick={() => onFilterChange('color', filters.color === color ? '' : color)}
                      title={color}
                    >
                      <div 
                        className="color-swatch"
                        style={{ backgroundColor: color.toLowerCase() }}
                      ></div>
                      <span>{color}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default FilterSidebar;