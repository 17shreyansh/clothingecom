const mongoose = require('mongoose');

const discountCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Discount code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [3, 'Code must be at least 3 characters'],
    maxlength: [20, 'Code cannot exceed 20 characters']
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  value: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount value cannot be negative']
  },
  minimumOrderAmount: {
    type: Number,
    default: 0,
    min: [0, 'Minimum order amount cannot be negative']
  },
  maximumDiscountAmount: {
    type: Number,
    min: [0, 'Maximum discount amount cannot be negative']
  },
  usageLimit: {
    type: Number,
    min: [1, 'Usage limit must be at least 1']
  },
  usedCount: {
    type: Number,
    default: 0,
    min: [0, 'Used count cannot be negative']
  },
  userUsageLimit: {
    type: Number,
    default: 1,
    min: [1, 'User usage limit must be at least 1']
  },
  usedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    usedCount: {
      type: Number,
      default: 1
    },
    lastUsed: {
      type: Date,
      default: Date.now
    }
  }],
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Validation for percentage discount
discountCodeSchema.pre('save', function(next) {
  if (this.type === 'percentage' && this.value > 100) {
    return next(new Error('Percentage discount cannot exceed 100%'));
  }
  
  if (this.validFrom >= this.validUntil) {
    return next(new Error('Valid from date must be before valid until date'));
  }
  
  this.updatedAt = Date.now();
  next();
});

// Method to check if code is valid for a user
discountCodeSchema.methods.isValidForUser = function(userId) {
  // Check if code is active
  if (!this.isActive) return { valid: false, reason: 'Code is inactive' };
  
  // Check date validity
  const now = new Date();
  if (now < this.validFrom) return { valid: false, reason: 'Code is not yet valid' };
  if (now > this.validUntil) return { valid: false, reason: 'Code has expired' };
  
  // Check usage limit
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, reason: 'Code usage limit exceeded' };
  }
  
  // Check user usage limit
  const userUsage = this.usedBy.find(usage => usage.user.toString() === userId.toString());
  if (userUsage && userUsage.usedCount >= this.userUsageLimit) {
    return { valid: false, reason: 'User usage limit exceeded' };
  }
  
  return { valid: true };
};

// Method to calculate discount amount
discountCodeSchema.methods.calculateDiscount = function(orderAmount) {
  if (orderAmount < this.minimumOrderAmount) {
    return 0;
  }
  
  let discountAmount = 0;
  
  if (this.type === 'percentage') {
    discountAmount = (orderAmount * this.value) / 100;
  } else {
    discountAmount = this.value;
  }
  
  // Apply maximum discount limit if set
  if (this.maximumDiscountAmount && discountAmount > this.maximumDiscountAmount) {
    discountAmount = this.maximumDiscountAmount;
  }
  
  return Math.round(discountAmount * 100) / 100; // Round to 2 decimal places
};

// Indexes
discountCodeSchema.index({ validFrom: 1, validUntil: 1 });
discountCodeSchema.index({ isActive: 1 });

module.exports = mongoose.model('DiscountCode', discountCodeSchema);