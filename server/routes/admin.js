const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount
} = require('../controllers/admin');
const upload = require('../middleware/upload');

// Apply authentication and admin middleware to all routes
router.use(protect);
router.use(adminOnly);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Products
router.route('/products')
  .get(getAllProducts)
  .post(upload.array('images', 5), createProduct);

router.route('/products/:id')
  .put(upload.array('images', 5), updateProduct)
  .delete(deleteProduct)
  .patch(updateProduct);

// Orders
router.route('/orders')
  .get(getAllOrders);

router.route('/orders/:id')
  .get(getOrderById);

router.patch('/orders/:id/status', updateOrderStatus);

// Users
router.route('/users')
  .get(getAllUsers);

router.route('/users/:id')
  .patch(updateUserRole)
  .delete(deleteUser);

// Categories
router.route('/categories')
  .get(getAllCategories)
  .post(createCategory);

router.route('/categories/:id')
  .put(updateCategory)
  .delete(deleteCategory);

// Discounts
router.route('/discounts')
  .get(getAllDiscounts)
  .post(createDiscount);

router.route('/discounts/:id')
  .put(updateDiscount)
  .delete(deleteDiscount);

module.exports = router;