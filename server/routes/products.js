const express = require('express');
const {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getNewArrivals,
  searchProducts,
  getFilterOptions,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  addReview,
  getProductReviews
} = require('../controllers/products');
const { protect, optionalAuth } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/search', searchProducts);
router.get('/filters', getFilterOptions);
router.get('/:slug', optionalAuth, getProduct);
router.get('/:id/reviews', getProductReviews);

// Protected routes
router.post('/:id/wishlist', protect, addToWishlist);
router.delete('/:id/wishlist', protect, removeFromWishlist);
router.get('/user/wishlist', protect, getWishlist);
router.post('/:id/reviews', protect, addReview);

module.exports = router;