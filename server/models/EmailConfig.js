const mongoose = require('mongoose');

const emailConfigSchema = new mongoose.Schema({
  smtpHost: { type: String, required: true, default: 'smtp.gmail.com' },
  smtpPort: { type: Number, required: true, default: 587 },
  smtpUser: { type: String, required: true },
  smtpPass: { type: String, required: true },
  fromEmail: { type: String, required: true },
  fromName: { type: String, required: true, default: 'Bhuvi Creations' },
  adminEmail: { type: String, required: true },
  notificationEmails: [{ type: String }],
  packingTimeDays: { type: Number, default: 2, min: 1, max: 30 },
  emailTemplates: {
    orderConfirmation: {
      subject: { type: String, default: 'Order Confirmation - {{orderNumber}}' },
      template: { type: String, default: 'Your order has been confirmed!' }
    },
    orderStatusUpdate: {
      subject: { type: String, default: 'Order Status Update - {{orderNumber}}' },
      template: { type: String, default: 'Your order status has been updated to {{status}}' }
    }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

emailConfigSchema.statics.getConfig = async function() {
  let config = await this.findOne({ isActive: true });
  if (!config) {
    config = await this.create({
      smtpUser: 'your-email@gmail.com',
      smtpPass: 'your-app-password',
      fromEmail: 'your-email@gmail.com',
      adminEmail: 'admin@example.com',
      notificationEmails: ['admin@example.com']
    });
  }
  return config;
};

module.exports = mongoose.model('EmailConfig', emailConfigSchema);