const EmailConfig = require('../models/EmailConfig');

exports.getEmailConfig = async (req, res) => {
  try {
    const config = await EmailConfig.getConfig();
    // Don't send password in response
    const { smtpPass, ...safeConfig } = config.toObject();
    res.json({ success: true, data: safeConfig });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateEmailConfig = async (req, res) => {
  try {
    const config = await EmailConfig.getConfig();
    Object.assign(config, req.body);
    await config.save();
    
    const { smtpPass, ...safeConfig } = config.toObject();
    res.json({ success: true, data: safeConfig });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.testEmail = async (req, res) => {
  try {
    const { testEmail } = req.body;
    const emailService = require('../services/emailService');
    
    await emailService.sendEmail({
      to: testEmail,
      subject: 'Test Email from Bhuvi Creations',
      html: '<h1>Test Email</h1><p>Your email configuration is working correctly!</p>'
    });
    
    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};