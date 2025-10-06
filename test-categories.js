const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('./server/models/Category');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clothing-ecommerce');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const createDefaultCategories = async () => {
  try {
    const existingCategories = await Category.find();
    console.log('Existing categories:', existingCategories.length);

    if (existingCategories.length === 0) {
      const defaultCategories = [
        { name: 'Men', description: 'Men\'s clothing and accessories' },
        { name: 'Women', description: 'Women\'s clothing and accessories' },
        { name: 'Kids', description: 'Children\'s clothing' }
      ];

      for (const cat of defaultCategories) {
        await Category.create(cat);
        console.log(`Created category: ${cat.name}`);
      }
    }

    const allCategories = await Category.find();
    console.log('All categories:', allCategories);
  } catch (error) {
    console.error('Error creating categories:', error);
  } finally {
    mongoose.connection.close();
  }
};

connectDB().then(createDefaultCategories);