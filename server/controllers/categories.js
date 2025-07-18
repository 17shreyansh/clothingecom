const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('subcategories')
      .sort({ sortOrder: 1, name: 1 });

    // Organize categories hierarchically
    const parentCategories = categories.filter(cat => !cat.parent);
    const result = parentCategories.map(parent => ({
      ...parent.toObject(),
      subcategories: categories.filter(cat => 
        cat.parent && cat.parent.toString() === parent._id.toString()
      )
    }));

    res.status(200).json({
      success: true,
      count: result.length,
      categories: result
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
};

// @desc    Get category by slug
// @route   GET /api/categories/:slug
// @access  Public
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ 
      slug: req.params.slug, 
      isActive: true 
    }).populate('subcategories');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category'
    });
  }
};

// @desc    Get products by category
// @route   GET /api/categories/:slug/products
// @access  Public
exports.getCategoryProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12, sort, minPrice, maxPrice } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const category = await Category.findOne({ 
      slug: req.params.slug, 
      isActive: true 
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Build query for products
    let query = { 
      $or: [
        { category: category._id },
        { subcategory: category._id }
      ],
      isActive: true 
    };

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sort options
    let sortOption = { createdAt: -1 };
    switch (sort) {
      case 'price-low':
        sortOption = { price: 1 };
        break;
      case 'price-high':
        sortOption = { price: -1 };
        break;
      case 'rating':
        sortOption = { averageRating: -1 };
        break;
      case 'popular':
        sortOption = { soldCount: -1 };
        break;
      case 'name':
        sortOption = { name: 1 };
        break;
    }

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .select('-reviews');

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      category,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      products
    });
  } catch (error) {
    console.error('Get category products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category products'
    });
  }
};