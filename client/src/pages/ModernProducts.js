import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
  Pagination,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  GridView as GridViewIcon,
  ViewList as ListViewIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import ModernProductCard from '../components/ui/ModernProductCard';
import { ProductGridSkeleton } from '../components/ui/ModernSkeleton';
import api from '../services/api';

const FilterSidebar = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: fit-content;
  width: 100%;
  position: sticky;
  top: 20px;
  
  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: 12px;
    position: static;
  }
`;

const ProductsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (min-width: 769px) {
    flex-direction: row;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    margin-bottom: 1rem;
    
    > div:first-child {
      order: 2;
    }
  }
`;

const ViewToggle = styled.div`
  display: flex;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;

  button {
    border: none;
    background: white;
    padding: 8px 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    
    &.active {
      background: #D4AF37;
      color: white;
    }
    
    &:hover {
      background: rgba(212, 175, 55, 0.1);
    }
  }
  
  @media (max-width: 768px) {
    align-self: center;
    order: 1;
  }
`;

const FilterChip = styled(Chip)`
  margin: 0.25rem !important;
  background: rgba(212, 175, 55, 0.1) !important;
  color: #D4AF37 !important;
  border: 1px solid #D4AF37 !important;
  
  .MuiChip-deleteIcon {
    color: #D4AF37 !important;
  }
`;

const PriceSlider = styled(Slider)`
  color: #D4AF37 !important;
  
  .MuiSlider-thumb {
    background: #D4AF37;
    border: 2px solid #D4AF37;
    
    &:hover {
      box-shadow: 0 0 0 8px rgba(212, 175, 55, 0.16);
    }
  }
  
  .MuiSlider-track {
    background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%);
  }
`;



const colors = [
  'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Black', 'White', 'Multicolor'
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' }
];

function ModernProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  
  // Filter options from API
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    brands: [],
    sizes: [],
    colors: [],
    priceRange: { minPrice: 0, maxPrice: 10000 }
  });
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('newest');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const productsPerPage = 12;

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    if (filterOptions.categories.length > 0) {
      initializeFiltersFromURL();
      fetchProducts();
    }
  }, [searchParams, filterOptions]);

  useEffect(() => {
    if (filterOptions.categories.length > 0) {
      fetchProducts();
    }
  }, [currentPage, sortBy, searchQuery, selectedCategory, selectedColors, selectedSizes, priceRange]);

  const fetchFilterOptions = async () => {
    try {
      const response = await api.get('/products/filters');
      if (response.data.success) {
        setFilterOptions(response.data.filters);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const initializeFiltersFromURL = () => {
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'All';
    const colors = searchParams.get('colors')?.split(',').filter(Boolean) || [];
    const sizes = searchParams.get('sizes')?.split(',').filter(Boolean) || [];
    const minPrice = parseInt(searchParams.get('minPrice')) || filterOptions.priceRange.minPrice;
    const maxPrice = parseInt(searchParams.get('maxPrice')) || filterOptions.priceRange.maxPrice;
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page')) || 1;

    setSearchQuery(search);
    setSelectedCategory(category);
    setSelectedColors(colors);
    setSelectedSizes(sizes);
    setPriceRange([minPrice, maxPrice]);
    setSortBy(sort);
    setCurrentPage(page);
  };

  const updateURL = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    if (selectedColors.length) params.set('colors', selectedColors.join(','));
    if (selectedSizes.length) params.set('sizes', selectedSizes.join(','));
    if (filterOptions.priceRange.minPrice !== undefined && filterOptions.priceRange.maxPrice !== undefined) {
      if (priceRange[0] > filterOptions.priceRange.minPrice || priceRange[1] < filterOptions.priceRange.maxPrice) {
        params.set('minPrice', priceRange[0].toString());
        params.set('maxPrice', priceRange[1].toString());
      }
    }
    if (sortBy !== 'newest') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    setSearchParams(params);
  };

  useEffect(() => {
    if (filterOptions.categories.length > 0) {
      updateURL();
    }
  }, [searchQuery, selectedCategory, selectedColors, selectedSizes, priceRange, sortBy, currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: productsPerPage,
        sort: sortBy,
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory !== 'All' && { categories: selectedCategory }),
        ...(selectedColors.length && { colors: selectedColors.join(',') }),
        ...(selectedSizes.length && { sizes: selectedSizes.join(',') }),
        ...(filterOptions.priceRange.minPrice !== undefined && priceRange[0] > filterOptions.priceRange.minPrice && { minPrice: priceRange[0] }),
        ...(filterOptions.priceRange.maxPrice !== undefined && priceRange[1] < filterOptions.priceRange.maxPrice && { maxPrice: priceRange[1] })
      };

      const response = await api.get('/products', { params });
      setProducts(response.data.products || []);
      setTotalProducts(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleColorToggle = (color) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
    setCurrentPage(1);
  };

  const handleSizeToggle = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
    setCurrentPage(1);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePriceChange = (newRange) => {
    setPriceRange(newRange);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedColors([]);
    setSelectedSizes([]);
    if (filterOptions.priceRange.minPrice !== undefined && filterOptions.priceRange.maxPrice !== undefined) {
      setPriceRange([filterOptions.priceRange.minPrice, filterOptions.priceRange.maxPrice]);
    }
    setSortBy('newest');
    setCurrentPage(1);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedCategory !== 'All') count++;
    if (selectedColors.length) count++;
    if (selectedSizes.length) count++;
    if (filterOptions.priceRange.minPrice !== undefined && filterOptions.priceRange.maxPrice !== undefined && 
        (priceRange[0] > filterOptions.priceRange.minPrice || priceRange[1] < filterOptions.priceRange.maxPrice)) count++;
    return count;
  }, [searchQuery, selectedCategory, selectedColors, selectedSizes, priceRange]);

  const FilterContent = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
           {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </Typography>
        {activeFiltersCount > 0 && (
          <Button size="small" onClick={clearFilters} sx={{ color: '#D4AF37' }}>
            Clear All
          </Button>
        )}
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Categories */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Categories
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant={selectedCategory === 'All' ? 'contained' : 'text'}
              onClick={() => handleCategoryChange('All')}
              sx={{
                justifyContent: 'flex-start',
                textTransform: 'none',
                ...(selectedCategory === 'All' && {
                  background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
                }),
              }}
            >
              All Categories
            </Button>
            {filterOptions.categories.map((category) => (
              <Button
                key={category._id}
                variant={selectedCategory === category.slug ? 'contained' : 'text'}
                onClick={() => handleCategoryChange(category.slug)}
                sx={{
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  ...(selectedCategory === category.slug && {
                    background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
                  }),
                }}
              >
                {category.name}
              </Button>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Price Range */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Price Range
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ px: 1 }}>
            <PriceSlider
              value={priceRange}
              onChange={(_, newValue) => handlePriceChange(newValue)}
              valueLabelDisplay="auto"
              min={filterOptions.priceRange.minPrice}
              max={filterOptions.priceRange.maxPrice}
              step={100}
              valueLabelFormat={(value) => `₹${value}`}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="body2">₹{priceRange[0]}</Typography>
              <Typography variant="body2">₹{priceRange[1]}</Typography>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Colors */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Colors
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {filterOptions.colors.map((color) => (
              <Chip
                key={color}
                label={color}
                variant={selectedColors.includes(color) ? 'filled' : 'outlined'}
                onClick={() => handleColorToggle(color)}
                sx={{
                  ...(selectedColors.includes(color) && {
                    backgroundColor: '#D4AF37',
                    color: 'white',
                  }),
                }}
              />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Sizes */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Sizes
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {filterOptions.sizes.map((size) => (
              <Chip
                key={size}
                label={size}
                variant={selectedSizes.includes(size) ? 'filled' : 'outlined'}
                onClick={() => handleSizeToggle(size)}
                sx={{
                  ...(selectedSizes.includes(size) && {
                    backgroundColor: '#D4AF37',
                    color: 'white',
                  }),
                }}
              />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: { xs: 2, md: 3 }, fontSize: { xs: '0.875rem', md: '1rem' } }}>
        <MuiLink component={Link} to="/" color="inherit">
          Home
        </MuiLink>
        <Typography color="text.primary">Products</Typography>
        {selectedCategory !== 'All' && (
          <Typography color="text.primary">
            {filterOptions.categories.find(cat => cat.slug === selectedCategory)?.name || selectedCategory}
          </Typography>
        )}
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: { xs: 2, md: 4 } }}>
        <Typography 
          variant={isSmallMobile ? "h4" : "h3"} 
          sx={{ 
            fontWeight: 700, 
            mb: 1,
            fontSize: { xs: '1.75rem', sm: '2.125rem', md: '3rem' }
          }}
        >
          {selectedCategory === 'All' ? 'All Products' : 
            filterOptions.categories.find(cat => cat.slug === selectedCategory)?.name || selectedCategory}
        </Typography>
        <Typography 
          variant={isSmallMobile ? "body1" : "h6"} 
          color="text.secondary"
        >
          {totalProducts} products found
        </Typography>
      </Box>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <Box sx={{ mb: { xs: 2, md: 4 } }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              mb: 1,
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            Active Filters:
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: { xs: 0.5, sm: 1 }
          }}>
            {searchQuery && (
              <FilterChip
                label={`Search: ${searchQuery}`}
                onDelete={() => setSearchQuery('')}
              />
            )}
            {selectedCategory !== 'All' && (
              <FilterChip
                label={filterOptions.categories.find(cat => cat.slug === selectedCategory)?.name || selectedCategory}
                onDelete={() => setSelectedCategory('All')}
              />
            )}
            {selectedColors.map((color) => (
              <FilterChip
                key={color}
                label={color}
                onDelete={() => handleColorToggle(color)}
              />
            ))}
            {selectedSizes.map((size) => (
              <FilterChip
                key={size}
                label={size}
                onDelete={() => handleSizeToggle(size)}
              />
            ))}
            {filterOptions.priceRange.minPrice !== undefined && filterOptions.priceRange.maxPrice !== undefined &&
             (priceRange[0] > filterOptions.priceRange.minPrice || priceRange[1] < filterOptions.priceRange.maxPrice) && (
              <FilterChip
                label={`₹${priceRange[0]} - ₹${priceRange[1]}`}
                onDelete={() => handlePriceChange([filterOptions.priceRange.minPrice, filterOptions.priceRange.maxPrice])}
              />
            )}
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        {/* Desktop Filters */}
        {!isMobile && (
          <Box sx={{ width: 280, flexShrink: 0, alignSelf: 'flex-start' }}>
            <FilterSidebar
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FilterContent />
            </FilterSidebar>
          </Box>
        )}

        {/* Products Section */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Products Header */}
          <Box sx={{ mb: { xs: 1, md: 1.5 } }}>
            <ProductsHeader>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 1, sm: 2 },
              flexWrap: 'wrap',
              width: '100%'
            }}>
              {isMobile && (
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => setMobileFilterOpen(true)}
                  size={isSmallMobile ? "small" : "medium"}
                  sx={{ 
                    minWidth: 'auto',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </Button>
              )}
              
              <FormControl 
                size="small" 
                sx={{ 
                  minWidth: { xs: 120, sm: 150 },
                  flex: { xs: 1, sm: 'none' }
                }}
              >
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <ViewToggle>
              <button
                className={viewMode === 'grid' ? 'active' : ''}
                onClick={() => setViewMode('grid')}
              >
                <GridViewIcon />
              </button>
              <button
                className={viewMode === 'list' ? 'active' : ''}
                onClick={() => setViewMode('list')}
              >
                <ListViewIcon />
              </button>
            </ViewToggle>
          </ProductsHeader>
          </Box>

          {/* Products Grid */}
          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : products.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
                {products.map((product, index) => (
                  <Grid 
                    item 
                    xs={viewMode === 'grid' ? 6 : 12}
                    sm={viewMode === 'grid' ? 6 : 12} 
                    md={viewMode === 'grid' ? 3 : 12} 
                    lg={viewMode === 'grid' ? 3 : 12}
                    xl={viewMode === 'grid' ? 3 : 12}
                    key={product._id}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                      <ModernProductCard product={product} />
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              py: { xs: 4, md: 8 },
              px: { xs: 2, md: 0 }
            }}>
              <Typography 
                variant={isSmallMobile ? "h6" : "h5"} 
                sx={{ 
                  mb: 2,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' }
                }}
              >
                No products found
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  mb: 3,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                Try adjusting your filters or search terms
              </Typography>
              <Button 
                variant="contained" 
                onClick={clearFilters}
                size={isSmallMobile ? "small" : "medium"}
              >
                Clear All Filters
              </Button>
            </Box>
          )}

          {/* Pagination */}
          {totalProducts > productsPerPage && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mt: { xs: 4, md: 6 },
              px: { xs: 1, sm: 0 }
            }}>
              <Pagination
                count={Math.ceil(totalProducts / productsPerPage)}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                color="primary"
                size={isSmallMobile ? "small" : "large"}
                siblingCount={isSmallMobile ? 0 : 1}
                boundaryCount={isSmallMobile ? 1 : 2}
              />
            </Box>
          )}
        </Box>
      </Box>

      {/* Mobile Filter Drawer */}
      <Drawer
        anchor="left"
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        PaperProps={{
          sx: { 
            width: { xs: '85vw', sm: 320 }, 
            maxWidth: 320,
            p: 2 
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Filters</Typography>
          <IconButton onClick={() => setMobileFilterOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <FilterContent />
      </Drawer>
    </Container>
  );
}

export default ModernProducts;