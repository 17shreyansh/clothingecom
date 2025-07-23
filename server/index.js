const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

// Connect to MongoDB
const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clothing-ecommerce');
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
const errorHandler = require('./middleware/errorHandler');
const HomepageContent = require('./models/HomepageContent');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');
const homepageContentRoutes = require('./routes/homepageContent');
const emailConfigRoutes = require('./routes/emailConfig');
const contactRoutes = require('./routes/contact');
const packingTimeRoutes = require('./routes/packingTime');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// Connect to database and initialize content
connectDB().then(() => {
  // Initialize homepage content after database connection
  setTimeout(() => {
    HomepageContent.createDefaultContent().catch(err => {
      console.error('Error creating default homepage content:', err);
    });
  }, 1000);
}).catch(err => {
  console.error('Database connection failed:', err);
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
// app.use('/api/', limiter);

// CORS configuration - Allow all origins in production
app.use(cors({
  origin: "https://clothingecom.vercel.app",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
// These routes share the same base path '/api/admin' but handle different endpoints:
// adminRoutes handles general admin functionality
// analyticsRoutes specifically handles analytics-related admin endpoints
// They can coexist since Express matches routes in order and each route file defines unique sub-paths
app.use('/api/admin', adminRoutes);
app.use('/api/admin', analyticsRoutes); // Analytics routes under admin namespace
app.use('/api/homepage', homepageContentRoutes);
app.use('/api/email-config', emailConfigRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/packing-time', packingTimeRoutes);


// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});

module.exports = app;