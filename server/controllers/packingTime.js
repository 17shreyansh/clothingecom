const EmailConfig = require('../models/EmailConfig');

exports.getPackingTime = async (req, res) => {
  try {
    const config = await EmailConfig.getConfig();
    
    const packingDate = new Date();
    packingDate.setDate(packingDate.getDate() + config.packingTimeDays);
    
    res.json({
      success: true,
      data: {
        packingTimeDays: config.packingTimeDays,
        packingStartDate: packingDate.toISOString(),
        message: `Your order will start packing within ${config.packingTimeDays} business day${config.packingTimeDays > 1 ? 's' : ''}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};