const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const {
      category,
      subcategory,
      minPrice,
      maxPrice,
      size,
      color,
      brand,
      sort,
      page = 1,
      limit = 12,
      featured,
      newArrival
    } = req.query;

    // Build query
    let query = { isActive: true };

    // Category filter
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }



    // Brand filter
    if (brand) {
      const brandArray = brand.split(',');
      query.brand = { $in: brandArray.map(b => new RegExp(b, 'i')) };
    }

    // Size filter
    if (size) {
      const sizeArray = size.split(',');
      query['variants.size'] = { $in: sizeArray };
    }

    // Color filter
    if (color) {
      const colorArray = color.split(',');
      query['variants.color'] = { $in: colorArray.map(c => new RegExp(c, 'i')) };
    }

    // Featured/New arrival filters
    if (featured === 'true') query.isFeatured = true;
    if (newArrival === 'true') query.isNewArrival = true;

    // Sort options
    let sortOption = { createdAt: -1 }; // Default: newest first
    
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

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .select('-reviews');

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    // Add to wishlist status if user is logged in
    if (req.user) {
      const user = await User.findById(req.user.id).select('wishlist');
      products.forEach(product => {
        product._doc.isInWishlist = user.wishlist.includes(product._id);
      });
    }

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products'
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:slug
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ 
      slug: req.params.slug, 
      isActive: true 
    })
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate('reviews.user', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    // Check if in wishlist
    if (req.user) {
      const user = await User.findById(req.user.id).select('wishlist');
      product._doc.isInWishlist = user.wishlist.includes(product._id);
    }

    // Get related products
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true
    })
      .limit(4)
      .select('name slug price images averageRating');

    res.status(200).json({
      success: true,
      product,
      relatedProducts
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product'
    });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ 
      isFeatured: true, 
      isActive: true 
    })
      .populate('category', 'name slug')
      .limit(8)
      .select('-reviews');

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured products'
    });
  }
};

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
// @access  Public
exports.getNewArrivals = async (req, res) => {
  try {
    const products = await Product.find({ 
      isNewArrival: true, 
      isActive: true 
    })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(8)
      .select('-reviews');

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get new arrivals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching new arrivals'
    });
  }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
exports.searchProducts = async (req, res) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Text search
    const products = await Product.find({
      $text: { $search: q },
      isActive: true
    })
      .populate('category', 'name slug')
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limitNum)
      .select('-reviews');

    const total = await Product.countDocuments({
      $text: { $search: q },
      isActive: true
    });

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      products,
      searchQuery: q
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during search'
    });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/products/:id/wishlist
// @access  Private
exports.addToWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (user.wishlist.includes(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    user.wishlist.push(req.params.id);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist'
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding to wishlist'
    });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/products/:id/wishlist
// @access  Private
exports.removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.wishlist = user.wishlist.filter(
      item => item.toString() !== req.params.id
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing from wishlist'
    });
  }
};

// @desc    Get user wishlist
// @route   GET /api/products/user/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'wishlist',
        select: 'name slug price images averageRating totalReviews',
        populate: {
          path: 'category',
          select: 'name slug'
        }
      });

    res.status(200).json({
      success: true,
      count: user.wishlist.length,
      wishlist: user.wishlist
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching wishlist'
    });
  }
};

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed
    const existingReview = product.reviews.find(
      review => review.user.toString() === req.user.id
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    const review = {
      user: req.user.id,
      rating: Number(rating),
      comment
    };

    product.reviews.push(review);
    product.calculateAverageRating();
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully'
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding review'
    });
  }
};

// @desc    Get filter options
// @route   GET /api/products/filters
// @access  Public
exports.getFilterOptions = async (req, res) => {
  try {
    const Category = require('../models/Category');
    
    // Get categories with product count
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: {
            $size: {
              $filter: {
                input: '$products',
                cond: { $eq: ['$$this.isActive', true] }
              }
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          slug: 1,
          productCount: 1
        }
      },
      { $sort: { name: 1 } }
    ]);
    
    // Get unique brands
    const brands = await Product.distinct('brand', { isActive: true, brand: { $ne: null, $ne: '' } });
    
    // Get unique sizes from variants
    const sizeAggregation = await Product.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$variants' },
      { $group: { _id: '$variants.size' } },
      { $sort: { _id: 1 } }
    ]);
    const sizes = sizeAggregation.map(item => item._id);
    
    // Get unique colors from variants
    const colorAggregation = await Product.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$variants' },
      { $group: { _id: '$variants.color' } },
      { $sort: { _id: 1 } }
    ]);
    const colors = colorAggregation.map(item => item._id);
    
    // Get price range
    const priceRange = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: {
        _id: null,
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }}
    ]);

    res.status(200).json({
      success: true,
      filters: {
        categories,
        brands: brands.filter(brand => brand).sort(),
        sizes,
        colors,
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 10000 }
      }
    });
  } catch (error) {
    console.error('Get filter options error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching filter options'
    });
  }
};

// @desc    Get product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
exports.getProductReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const product = await Product.findById(req.params.id)
      .populate({
        path: 'reviews.user',
        select: 'name'
      })
      .select('reviews averageRating totalReviews');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Paginate reviews
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedReviews = product.reviews
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      reviews: paginatedReviews,
      averageRating: product.averageRating,
      totalReviews: product.totalReviews,
      currentPage: pageNum,
      totalPages: Math.ceil(product.reviews.length / limitNum)
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews'
    });
  }
};