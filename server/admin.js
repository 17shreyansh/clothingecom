require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminData = {
      name: 'Admin',
      email: 'admin@clothing.com',
      password: 'admin@123',
      role: 'admin',
      isActive: true
    };

    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('❌ Admin already exists!');
      console.log('Email:', adminData.email);
      process.exit(0);
    }

    const admin = await User.create(adminData);
    
    console.log('✅ Admin created successfully!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('👤 Role:', admin.role);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

createAdmin();