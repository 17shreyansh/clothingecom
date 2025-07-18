import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter, FiGrid, FiList, FiX, FiChevronDown, FiSliders } from 'react-icons/fi';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { toast } from 'react-toastify';
import './Products.css';

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    sizes: [],
    colors: [],
    brands: []
  });

  const [availableFilters, setAvailableFilters] = useState({
    sizes: [],
    colors: [],
    brands: []
  });

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'name', label: 'Name A-Z' }
  ];

  const currentSort = searchParams.get('sort') || 'newest';

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchFilterOptions();
  }, [searchParams]);

  useEffect(() => {
    const search = searchParams.get('search') || '';
    setSearchInput(search);
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(searchParams);
      const response = await api.get('/products', { params });
      
      if (response.data.success) {
        setProducts(response.data.products);
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

  const fetchFilterOptions = async () => {
    try {
      const response = await api.get('/products/filters');
      if (response.data.success) {
        setAvailableFilters(response.data.filters);
        setPriceRange([response.data.filters.priceRange.minPrice, response.data.filters.priceRange.maxPrice]);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const updateSearchParams = useCallback((updates) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== '' && value !== '0') {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const handleSearch = useCallback((value) => {
    updateSearchParams({ search: value, page: 1 });
  }, [updateSearchParams]);

  const handleFilterChange = useCallback((filterType, value, checked) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev };
      if (checked) {
        newFilters[filterType] = [...prev[filterType], value];
      } else {
        newFilters[filterType] = prev[filterType].filter(item => item !== value);
      }
      
      updateSearchParams({
        [filterType]: newFilters[filterType].join(','),
        page: 1
      });
      
      return newFilters;
    });
  }, [updateSearchParams]);

  const handlePriceChange = useCallback((min, max) => {
    setPriceRange([min, max]);
    updateSearchParams({ 
      minPrice: min > 0 ? min : '',
      maxPrice: max < 10000 ? max : '',
      page: 1
    });
  }, [updateSearchParams]);

  const clearAllFilters = () => {
    setSearchParams({});
    setSearchInput('');
    setPriceRange([0, 10000]);
    setSelectedFilters({
      categories: [],
      sizes: [],
      colors: [],
      brands: []
    });
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchParams.get('search')) count++;
    if (searchParams.get('category')) count++;
    if (searchParams.get('minPrice') || searchParams.get('maxPrice')) count++;
    Object.values(selectedFilters).forEach(arr => count += arr.length);
    return count;
  }, [searchParams, selectedFilters]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    
    // Apply sorting
    switch (currentSort) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    return filtered;
  }, [products, currentSort]);

  if (loading) {
    return (
      <div className="products-page">
        <div className="container">
          <div className="products-loading">
            <div className="skeleton-header">
              <div className="skeleton" style={{ height: '40px', width: '300px' }}></div>
              <div className="skeleton" style={{ height: '40px', width: '200px' }}></div>
            </div>
            <div className="skeleton-content">
              <div className="skeleton-sidebar">
                <div className="skeleton" style={{ height: '400px' }}></div>
              </div>
              <div className="skeleton-grid">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="skeleton product-skeleton"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="container">
        {/* Search Bar */}
        <div className="search-section">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search products, brands, categories..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchInput)}
              className="search-input"
            />
            {searchInput && (
              <button 
                onClick={() => {
                  setSearchInput('');
                  handleSearch('');
                }}
                className="search-clear"
              >
                <FiX />
              </button>
            )}
            <button 
              onClick={() => handleSearch(searchInput)}
              className="search-btn"
            >
              Search
            </button>
          </div>
        </div>

        {/* Breadcrumb & Header */}
        <div className="products-header">
          <div className="header-left">
            <nav className="breadcrumb">
              <span>Home</span>
              <span>/</span>
              <span>Products</span>
              {searchParams.get('category') && (
                <>
                  <span>/</span>
                  <span>{searchParams.get('category')}</span>
                </>
              )}
            </nav>
            <h1>
              {searchParams.get('search') ? `Search: "${searchParams.get('search')}"` : 
               searchParams.get('category') ? `${searchParams.get('category')} Collection` : 'All Products'}
            </h1>
            <p className="results-count">{filteredProducts.length} products found</p>
          </div>
          
          <div className="header-controls">
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <FiGrid />
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <FiList />
              </button>
            </div>
            
            <div className="sort-dropdown">
              <select
                value={currentSort}
                onChange={(e) => updateSearchParams({ sort: e.target.value })}
                className="sort-select"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FiChevronDown className="dropdown-icon" />
            </div>

            <button
              className="filters-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiSliders />
              Filters
              {activeFiltersCount > 0 && (
                <span className="filter-count">{activeFiltersCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="active-filters">
            <div className="filter-tags">
              {searchParams.get('search') && (
                <span className="filter-tag">
                  Search: {searchParams.get('search')}
                  <button onClick={() => handleSearch('')}>
                    <FiX />
                  </button>
                </span>
              )}
              {searchParams.get('category') && (
                <span className="filter-tag">
                  Category: {searchParams.get('category')}
                  <button onClick={() => updateSearchParams({ category: '' })}>
                    <FiX />
                  </button>
                </span>
              )}
              {(searchParams.get('minPrice') || searchParams.get('maxPrice')) && (
                <span className="filter-tag">
                  Price: ₹{searchParams.get('minPrice') || 0} - ₹{searchParams.get('maxPrice') || '10000+'}
                  <button onClick={() => handlePriceChange(0, 10000)}>
                    <FiX />
                  </button>
                </span>
              )}
            </div>
            <button onClick={clearAllFilters} className="clear-all-btn">
              Clear All
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="products-content">
          {/* Filters Sidebar */}
          <div className={`filters-sidebar ${showFilters ? 'open' : ''}`}>
            <div className="filters-header">
              <h3>Filters</h3>
              <button 
                onClick={() => setShowFilters(false)}
                className="close-filters"
              >
                <FiX />
              </button>
            </div>

            <div className="filters-content">
              {/* Categories */}
              <div className="filter-group">
                <h4>Categories</h4>
                <div className="filter-options">
                  {availableFilters.categories?.map(category => (
                    <label key={category._id} className="filter-option">
                      <input
                        type="checkbox"
                        checked={selectedFilters.categories.includes(category.name)}
                        onChange={(e) => handleFilterChange('categories', category.name, e.target.checked)}
                      />
                      <span>{category.name}</span>
                      <span className="count">({category.productCount || 0})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="filter-group">
                <h4>Price Range</h4>
                <div className="price-range">
                  <div className="price-inputs">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      onBlur={() => handlePriceChange(priceRange[0], priceRange[1])}
                    />
                    <span>to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                      onBlur={() => handlePriceChange(priceRange[0], priceRange[1])}
                    />
                  </div>
                </div>
              </div>

              {/* Sizes */}
              <div className="filter-group">
                <h4>Sizes</h4>
                <div className="filter-chips">
                  {availableFilters.sizes.map(size => (
                    <label key={size} className="filter-chip">
                      <input
                        type="checkbox"
                        checked={selectedFilters.sizes.includes(size)}
                        onChange={(e) => handleFilterChange('sizes', size, e.target.checked)}
                      />
                      <span>{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="filter-group">
                <h4>Colors</h4>
                <div className="color-filters">
                  {availableFilters.colors.map(color => (
                    <label key={color} className="color-option">
                      <input
                        type="checkbox"
                        checked={selectedFilters.colors.includes(color)}
                        onChange={(e) => handleFilterChange('colors', color, e.target.checked)}
                      />
                      <span 
                        className="color-swatch"
                        style={{ backgroundColor: color.toLowerCase() }}
                      ></span>
                      <span>{color}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="filter-group">
                <h4>Brands</h4>
                <div className="filter-options">
                  {availableFilters.brands.map(brand => (
                    <label key={brand} className="filter-option">
                      <input
                        type="checkbox"
                        checked={selectedFilters.brands.includes(brand)}
                        onChange={(e) => handleFilterChange('brands', brand, e.target.checked)}
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="filters-footer">
              <button onClick={clearAllFilters} className="btn btn-outline">
                Clear All
              </button>
              <button 
                onClick={() => setShowFilters(false)}
                className="btn btn-primary"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="products-main">
            {filteredProducts.length > 0 ? (
              <div className={`products-${viewMode}`}>
                {filteredProducts.map(product => (
                  <ProductCard 
                    key={product._id} 
                    product={product} 
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              <div className="no-products">
                <div className="no-products-icon">
                  <FiSearch />
                </div>
                <h3>No products found</h3>
                <p>Try adjusting your search terms or filters</p>
                <button onClick={clearAllFilters} className="btn btn-primary">
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filters Overlay */}
        {showFilters && (
          <div 
            className="filters-overlay"
            onClick={() => setShowFilters(false)}
          ></div>
        )}
      </div>
    </div>
  );
}

export default Products;