import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiGrid, FiList, FiX, FiChevronDown, FiSliders } from 'react-icons/fi';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { toast } from 'react-toastify';
import './Products.css';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState('');
  
  const [filters, setFilters] = useState({
    categories: [],
    brands: [],
    sizes: [],
    colors: [],
    priceRange: { minPrice: 0, maxPrice: 10000 }
  });

  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    brands: [],
    sizes: [],
    colors: []
  });

  const [priceRange, setPriceRange] = useState([0, 10000]);

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'name', label: 'Name A-Z' }
  ];

  // Initialize from URL after filters are loaded
  useEffect(() => {
    if (filters.categories.length > 0) {
      const search = searchParams.get('search') || '';
      const categories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
      const brands = searchParams.get('brands')?.split(',').filter(Boolean) || [];
      const sizes = searchParams.get('sizes')?.split(',').filter(Boolean) || [];
      const colors = searchParams.get('colors')?.split(',').filter(Boolean) || [];
      const minPrice = parseInt(searchParams.get('minPrice')) || filters.priceRange.minPrice || 0;
      const maxPrice = parseInt(searchParams.get('maxPrice')) || filters.priceRange.maxPrice || 10000;

      setSearchInput(search);
      setSelectedFilters({ categories, brands, sizes, colors });
      setPriceRange([minPrice, maxPrice]);
    }
  }, [searchParams, filters]);

  // Fetch data
  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    if (filters.categories.length > 0) {
      fetchProducts();
    }
  }, [searchParams, filters]);

  const fetchFilters = async () => {
    try {
      const response = await api.get('/products/filters');
      if (response.data.success) {
        setFilters(response.data.filters);
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(searchParams);
      const response = await api.get('/products', { params });
      
      if (response.data.success) {
        setProducts(response.data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const updateURL = useCallback((updates) => {
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

  const handleSearch = () => {
    updateURL({ search: searchInput, page: 1 });
  };

  const handleFilterChange = (type, value, checked) => {
    const newFilters = { ...selectedFilters };
    
    if (checked) {
      newFilters[type] = [...newFilters[type], value];
    } else {
      newFilters[type] = newFilters[type].filter(item => item !== value);
    }
    
    setSelectedFilters(newFilters);
    updateURL({ [type]: newFilters[type].join(','), page: 1 });
  };

  const handlePriceChange = () => {
    updateURL({ 
      minPrice: priceRange[0] > 0 ? priceRange[0] : '',
      maxPrice: priceRange[1] < 10000 ? priceRange[1] : '',
      page: 1 
    });
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setSearchInput('');
    setSelectedFilters({ categories: [], brands: [], sizes: [], colors: [] });
    setPriceRange([0, 10000]);
  };

  const activeFiltersCount = 
    (searchParams.get('search') ? 1 : 0) +
    (searchParams.get('categories')?.split(',').filter(Boolean).length || 0) +
    (searchParams.get('brands')?.split(',').filter(Boolean).length || 0) +
    (searchParams.get('sizes')?.split(',').filter(Boolean).length || 0) +
    (searchParams.get('colors')?.split(',').filter(Boolean).length || 0) +
    (searchParams.get('minPrice') || searchParams.get('maxPrice') ? 1 : 0);

  if (loading) {
    return (
      <div className="products-page">
        <div className="container">
          <div className="products-loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="container">
        {/* Search */}
        <div className="search-section">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch}>Search</button>
          </div>
        </div>

        {/* Header */}
        <div className="products-header">
          <div className="header-left">
            <h1>Products</h1>
            <p>{products.length} products found</p>
          </div>
          
          <div className="header-controls">
            <div className="view-toggle">
              <button
                className={viewMode === 'grid' ? 'active' : ''}
                onClick={() => setViewMode('grid')}
              >
                <FiGrid />
              </button>
              <button
                className={viewMode === 'list' ? 'active' : ''}
                onClick={() => setViewMode('list')}
              >
                <FiList />
              </button>
            </div>
            
            <select
              value={searchParams.get('sort') || 'newest'}
              onChange={(e) => updateURL({ sort: e.target.value })}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button onClick={() => setShowFilters(!showFilters)}>
              <FiSliders /> Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
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
                  <button onClick={() => updateURL({ search: '' })}>
                    <FiX />
                  </button>
                </span>
              )}
              
              {searchParams.get('categories')?.split(',').filter(Boolean).map(cat => (
                <span key={cat} className="filter-tag">
                  {cat}
                  <button onClick={() => {
                    const cats = searchParams.get('categories').split(',').filter(c => c !== cat);
                    updateURL({ categories: cats.join(',') });
                  }}>
                    <FiX />
                  </button>
                </span>
              ))}
            </div>
            <button onClick={clearAllFilters}>Clear All</button>
          </div>
        )}

        <div className="products-content">
          {/* Sidebar */}
          <div className={`filters-sidebar ${showFilters ? 'open' : ''}`}>
            <div className="filters-header">
              <h3>Filters</h3>
              <button onClick={() => setShowFilters(false)}>
                <FiX />
              </button>
            </div>

            <div className="filters-content">
              {/* Categories */}
              <div className="filter-group">
                <h4>Categories</h4>
                {filters.categories?.map(category => (
                  <label key={category._id} className="filter-option">
                    <input
                      type="checkbox"
                      checked={selectedFilters.categories.includes(category.slug)}
                      onChange={(e) => handleFilterChange('categories', category.slug, e.target.checked)}
                    />
                    <span>{category.name}</span>
                  </label>
                ))}
              </div>

              {/* Price Range */}
              <div className="filter-group">
                <h4>Price Range</h4>
                <div className="price-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                    onBlur={handlePriceChange}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                    onBlur={handlePriceChange}
                  />
                </div>
              </div>

              {/* Brands */}
              <div className="filter-group">
                <h4>Brands</h4>
                {filters.brands?.map(brand => (
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

              {/* Sizes */}
              <div className="filter-group">
                <h4>Sizes</h4>
                <div className="filter-chips">
                  {filters.sizes?.map(size => (
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
                  {filters.colors?.map(color => (
                    <label key={color} className="color-option">
                      <input
                        type="checkbox"
                        checked={selectedFilters.colors.includes(color)}
                        onChange={(e) => handleFilterChange('colors', color, e.target.checked)}
                      />
                      <span className="color-swatch" style={{ backgroundColor: color.toLowerCase() }}></span>
                      <span>{color}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="products-main">
            {products.length > 0 ? (
              <div className={`products-${viewMode}`}>
                {products.map(product => (
                  <ProductCard key={product._id} product={product} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="no-products">
                <h3>No products found</h3>
                <p>Try adjusting your filters</p>
                <button onClick={clearAllFilters}>Clear All Filters</button>
              </div>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="filters-overlay" onClick={() => setShowFilters(false)}></div>
        )}
      </div>
    </div>
  );
}

export default Products;