const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['new', 'read', 'replied', 'closed'], default: 'new' },
  adminNotes: { type: String },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

// Track if document is new
contactSchema.pre('save', function(next) {
  this.wasNew = this.isNew;
  next();
});

// Create notification for new contact leads
contactSchema.post('save', async function(doc, next) {
  if (this.wasNew) {
    try {
      const Notification = require('./Notification');
      await Notification.create({
        type: 'lead',
        title: 'New Contact Lead',
        message: `New contact inquiry from ${doc.name} - ${doc.subject}`,
        relatedId: doc._id,
        relatedModel: 'Contact',
        priority: 'medium',
        data: {
          name: doc.name,
          email: doc.email,
          subject: doc.subject
        }
      });
    } catch (error) {
      console.error('Error creating contact notification:', error);
    }
  }
  next();
});

module.exports = mongoose.model('Contact', contactSchema);