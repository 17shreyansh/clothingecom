require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');

const clearData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Remove all orders
    const orderResult = await Order.deleteMany({});
    console.log(`✅ Deleted ${orderResult.deletedCount} orders.`);

    // Remove all users except admin
    // If you want to keep ONLY a specific admin email, change this to: { email: { $ne: 'admin@bhuvicreations.com' } }
    const userResult = await User.deleteMany({ role: { $ne: 'admin' } });
    console.log(`✅ Deleted ${userResult.deletedCount} users (kept admin).`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

clearData();
