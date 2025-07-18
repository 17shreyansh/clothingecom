const nodemailer = require('nodemailer');
const EmailConfig = require('../models/EmailConfig');

class EmailService {
  constructor() {
    this.transporter = null;
  }

  async getTransporter() {
    if (!this.transporter) {
      const config = await EmailConfig.getConfig();
      this.transporter = nodemailer.createTransporter({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: false,
        auth: {
          user: config.smtpUser,
          pass: config.smtpPass
        }
      });
    }
    return this.transporter;
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      const config = await EmailConfig.getConfig();
      const transporter = await this.getTransporter();
      
      const mailOptions = {
        from: `${config.fromName} <${config.fromEmail}>`,
        to,
        subject,
        html,
        text
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  }

  async sendOrderConfirmation(order, user) {
    const config = await EmailConfig.getConfig();
    const subject = config.emailTemplates.orderConfirmation.subject.replace('{{orderNumber}}', order.orderNumber);
    
    const packingDate = new Date();
    packingDate.setDate(packingDate.getDate() + config.packingTimeDays);
    
    const html = `
      <h2>Order Confirmation</h2>
      <p>Dear ${user.name},</p>
      <p>Thank you for your order! Your order #${order.orderNumber} has been confirmed.</p>
      <h3>Order Details:</h3>
      <ul>
        ${order.items.map(item => `<li>${item.name} - Qty: ${item.quantity} - ₹${item.price}</li>`).join('')}
      </ul>
      <p><strong>Total: ₹${order.totalAmount}</strong></p>
      <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h4 style="color: #2196F3; margin: 0 0 10px 0;">📦 Packing Information</h4>
        <p style="margin: 0;">Your order will start packing within <strong>${config.packingTimeDays} business day${config.packingTimeDays > 1 ? 's' : ''}</strong></p>
        <p style="margin: 5px 0 0 0; color: #666;">Expected packing start: ${packingDate.toLocaleDateString()}</p>
      </div>
      <p>We'll notify you when your order ships.</p>
    `;

    await this.sendEmail({
      to: user.email,
      subject,
      html
    });

    await this.sendEmail({
      to: config.adminEmail,
      subject: `New Order Received - ${order.orderNumber}`,
      html: `<h2>New Order</h2><p>Order #${order.orderNumber} from ${user.name} (${user.email})</p>${html}`
    });
  }

  async sendOrderStatusUpdate(order, user, newStatus) {
    const config = await EmailConfig.getConfig();
    const subject = config.emailTemplates.orderStatusUpdate.subject
      .replace('{{orderNumber}}', order.orderNumber);
    
    const html = `
      <h2>Order Status Update</h2>
      <p>Dear ${user.name},</p>
      <p>Your order #${order.orderNumber} status has been updated to: <strong>${newStatus}</strong></p>
    `;

    await this.sendEmail({
      to: user.email,
      subject,
      html
    });
  }

  async sendContactNotification(contact) {
    const config = await EmailConfig.getConfig();
    
    const html = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${contact.name}</p>
      <p><strong>Email:</strong> ${contact.email}</p>
      <p><strong>Phone:</strong> ${contact.phone || 'Not provided'}</p>
      <p><strong>Subject:</strong> ${contact.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${contact.message}</p>
      <p><strong>Submitted:</strong> ${new Date(contact.createdAt).toLocaleString()}</p>
    `;

    // Send to admin and notification emails
    const recipients = [config.adminEmail, ...config.notificationEmails];
    
    for (const email of recipients) {
      await this.sendEmail({
        to: email,
        subject: `New Contact Form: ${contact.subject}`,
        html
      });
    }
  }
}

module.exports = new EmailService();