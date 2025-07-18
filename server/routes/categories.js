const express = require('express');
const {
  getCategories,
  getCategoryBySlug,
  getCategoryProducts
} = require('../controllers/categories');

const router = express.Router();

router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);
router.get('/:slug/products', getCategoryProducts);

module.exports = router;