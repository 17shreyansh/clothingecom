const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clothing-ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const errorHandler = require('./middleware/errorHandler');
const HomepageContent = require('./models/HomepageContent');

// Routes
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
const notificationRoutes = require('./routes/notifications');

const app = express();

// Trust proxy to correctly handle secure cookies and client IPs behind NGINX
app.set('trust proxy', 1);

// Connect to MongoDB and initialize homepage content
connectDB().then(() => {
  setTimeout(() => {
    HomepageContent.createDefaultContent().catch(err => {
      console.error('Error creating default homepage content:', err);
    });
  }, 1000);
}).catch(err => {
  console.error('Database connection failed:', err);
});

// Security middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Rate limiting for API (enable as needed)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
// app.use('/api/', limiter);

// CORS configuration with explicit allowed origins
const allowedOrigins = [
  'https://bhuvicreations.com',
  'https://www.bhuvicreations.com',
  'http://localhost:3000',
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

// Body parsing middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Serve uploaded files statically
// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add CORS for uploads
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', analyticsRoutes);
app.use('/api/homepage', homepageContentRoutes);
app.use('/api/email-config', emailConfigRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/packing-time', packingTimeRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Centralized error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Graceful shutdown handling
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

module.exports = app;
