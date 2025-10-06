const HomepageContent = require('../models/HomepageContent');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/homepage');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Initialize multer upload
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get homepage content
exports.getHomepageContent = async (req, res) => {
  try {
    console.log('Fetching homepage content...');
    
    // Find or create homepage content
    let content = await HomepageContent.findOne();
    
    if (!content) {
      console.log('No homepage content found, creating default...');
      // Create default content if none exists
      await HomepageContent.createDefaultContent();
      content = await HomepageContent.findOne();
    }
    
    console.log('Homepage content found:', !!content);
    
    res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error fetching homepage content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching homepage content',
      error: error.message
    });
  }
};

// Update homepage content
exports.updateHomepageContent = async (req, res) => {
  try {
    const { section } = req.params;
    const updateData = req.body;
    
    console.log(`Updating section: ${section}`, updateData);
    
    // Validate section
    const validSections = [
      'heroSection', 'categoryShowcase', 'featuredProducts', 
      'parallaxBanner', 'statsCounter', 'lookbookGallery',
      'instagramFeed', 'testimonials', 'trustBadges', 
      'imageShowcase', 'sectionsOrder'
    ];
    
    if (!validSections.includes(section)) {
      return res.status(400).json({
        success: false,
        message: `Invalid section name: ${section}. Valid sections: ${validSections.join(', ')}`
      });
    }
    
    // Find or create homepage content
    let content = await HomepageContent.findOne();
    
    if (!content) {
      console.log('No content found, creating default...');
      await HomepageContent.createDefaultContent();
      content = await HomepageContent.findOne();
    }
    
    // Update the specific section
    content[section] = updateData;
    content.lastUpdated = Date.now();
    
    await content.save();
    
    console.log(`Section ${section} updated successfully`);
    
    res.status(200).json({
      success: true,
      message: `${section} updated successfully`,
      data: content[section]
    });
  } catch (error) {
    console.error('Error updating homepage content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating homepage content',
      error: error.message
    });
  }
};

// Upload image for homepage content
exports.uploadImage = async (req, res) => {
  try {
    const uploadMiddleware = upload.single('image');
    
    uploadMiddleware(req, res, async (err) => {
      if (err) {
        console.error('Upload middleware error:', err);
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }
      
      console.log('File uploaded:', req.file.filename);
      
      // Create image URL
      const imageUrl = `https://api.bhuvicreations.com/uploads/homepage/${req.file.filename}`;
      
      res.status(200).json({
        success: true,
        imageUrl,
        message: 'Image uploaded successfully'
      });
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading image',
      error: error.message
    });
  }
};

// Update section order
exports.updateSectionsOrder = async (req, res) => {
  try {
    const { sectionsOrder } = req.body;
    
    if (!Array.isArray(sectionsOrder)) {
      return res.status(400).json({
        success: false,
        message: 'Sections order must be an array'
      });
    }
    
    // Find or create homepage content
    let content = await HomepageContent.findOne();
    
    if (!content) {
      await HomepageContent.createDefaultContent();
      content = await HomepageContent.findOne();
    }
    
    content.sectionsOrder = sectionsOrder;
    content.lastUpdated = Date.now();
    
    await content.save();
    
    res.status(200).json({
      success: true,
      message: 'Sections order updated successfully',
      data: content.sectionsOrder
    });
  } catch (error) {
    console.error('Error updating sections order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating sections order'
    });
  }
};

// Toggle section visibility
exports.toggleSectionVisibility = async (req, res) => {
  try {
    const { section } = req.params;
    const { enabled } = req.body;
    
    // Validate section
    const validSections = [
      'heroSection', 'categoryShowcase', 'featuredProducts', 
      'parallaxBanner', 'statsCounter', 'lookbookGallery',
      'instagramFeed', 'testimonials', 'trustBadges', 
      'imageShowcase'
    ];
    
    if (!validSections.includes(section)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid section name'
      });
    }
    
    // Find or create homepage content
    let content = await HomepageContent.findOne();
    
    if (!content) {
      await HomepageContent.createDefaultContent();
      content = await HomepageContent.findOne();
    }
    
    // Update the enabled status
    content[section].enabled = enabled;
    content.lastUpdated = Date.now();
    
    await content.save();
    
    res.status(200).json({
      success: true,
      message: `${section} visibility updated successfully`,
      enabled: content[section].enabled
    });
  } catch (error) {
    console.error('Error toggling section visibility:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling section visibility'
    });
  }
};