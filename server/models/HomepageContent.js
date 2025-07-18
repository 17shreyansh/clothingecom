const mongoose = require('mongoose');

const heroSectionSchema = new mongoose.Schema({
  title: { type: String, default: 'Bhuvi Creations' },
  titleParts: {
    primary: { type: String, default: 'Bhuvi' },
    secondary: { type: String, default: 'Creations' },
    primaryClass: { type: String, default: 'hero-title-primary' },
    secondaryClass: { type: String, default: 'hero-title-secondary' }
  },
  subtitle: { type: String, default: 'Where Tradition Meets Elegance: Exquisite Indian Wear for Every Occasion.' },
  sliderImages: [{
    url: { type: String, required: true },
    alt: { type: String, default: 'Collection Image' }
  }],
  enabled: { type: Boolean, default: true }
});

const categoryShowcaseSchema = new mongoose.Schema({
  title: { type: String, default: 'Shop by Category' },
  subtitle: { type: String, default: 'Discover timeless elegance in our curated selection of traditional wear' },
  categories: [{
    name: { type: String, required: true },
    image: { type: String, required: true },
    link: { type: String, required: true },
    count: { type: String },
    order: { type: Number }
  }],
  layout: { type: String, enum: ['grid', 'carousel'], default: 'grid' },
  maxDisplay: { type: Number, default: 4 },
  enabled: { type: Boolean, default: true }
});

const featuredProductsSchema = new mongoose.Schema({
  title: { type: String, default: 'Featured Products' },
  subtitle: { type: String, default: 'Our handpicked selection of premium products' },
  buttonText: { type: String, default: 'View All Products' },
  limit: { type: Number, default: 8 },
  enabled: { type: Boolean, default: true }
});

const parallaxBannerSchema = new mongoose.Schema({
  title: { type: String, default: 'Timeless Elegance' },
  subtitle: { type: String, default: 'Discover our handcrafted collection of traditional Indian wear' },
  buttonText: { type: String, default: 'Shop Collection' },
  buttonLink: { type: String, default: '/products' },
  backgroundImage: { type: String, default: '/default-parallax.jpg' },
  enabled: { type: Boolean, default: true }
});

const statsCounterSchema = new mongoose.Schema({
  title: { type: String, default: 'Our Journey in Numbers' },
  subtitle: { type: String, default: 'Building trust through quality and excellence' },
  stats: [{
    number: { type: Number, required: true },
    suffix: { type: String, default: '+' },
    label: { type: String, required: true },
    icon: { type: String, enum: ['People', 'TrendingUp', 'LocationOn', 'Star'], default: 'People' }
  }],
  enabled: { type: Boolean, default: true }
});

const lookbookGallerySchema = new mongoose.Schema({
  title: { type: String, default: 'Style Lookbook' },
  subtitle: { type: String, default: 'Discover endless style possibilities with our curated fashion gallery' },
  items: [{
    id: { type: Number, required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    src: { type: String, required: true }
  }],
  enabled: { type: Boolean, default: true }
});

const instagramFeedSchema = new mongoose.Schema({
  title: { type: String, default: 'Follow Our Journey' },
  subtitle: { type: String, default: '@bhuvicreations - Daily fashion inspiration and behind-the-scenes' },
  buttonText: { type: String, default: 'Follow on Instagram' },
  instagramLink: { type: String, default: 'https://instagram.com/bhuvicreations' },
  username: { type: String, default: 'bhuvicreations' },
  posts: [{
    id: { type: Number, required: true },
    image: { type: String, required: true },
    avatar: { type: String, required: true },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 }
  }],
  enabled: { type: Boolean, default: true }
});

const testimonialSchema = new mongoose.Schema({
  title: { type: String, default: 'Customer Stories' },
  subtitle: { type: String, default: 'Hear from our satisfied customers about their shopping experience' },
  testimonials: [{
    name: { type: String, required: true },
    location: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true },
    product: { type: String },
    avatar: { type: String },
    verified: { type: Boolean, default: true }
  }],
  autoplay: { type: Boolean, default: true },
  autoplaySpeed: { type: Number, default: 5000 },
  enabled: { type: Boolean, default: true }
});

const trustBadgesSchema = new mongoose.Schema({
  badges: [{
    title: { type: String, required: true },
    desc: { type: String, required: true },
    iconType: { type: String, enum: ['secure', 'shipping', 'support', 'quality', 'rating', 'returns'], required: true }
  }],
  enabled: { type: Boolean, default: true }
});

const imageShowcaseSchema = new mongoose.Schema({
  title: { type: String, default: 'Our Collection' },
  subtitle: { type: String, default: 'Discover the beauty of traditional Indian wear' },
  images: [{
    src: { type: String, required: true },
    hoverSrc: { type: String, required: true },
    title: { type: String, required: true }
  }],
  enabled: { type: Boolean, default: true }
});

const homepageContentSchema = new mongoose.Schema({
  heroSection: heroSectionSchema,
  categoryShowcase: categoryShowcaseSchema,
  featuredProducts: featuredProductsSchema,
  parallaxBanner: parallaxBannerSchema,
  statsCounter: statsCounterSchema,
  lookbookGallery: lookbookGallerySchema,
  instagramFeed: instagramFeedSchema,
  testimonials: testimonialSchema,
  trustBadges: trustBadgesSchema,
  imageShowcase: imageShowcaseSchema,
  sectionsOrder: [{ type: String }],
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// Create or update default content
homepageContentSchema.statics.createDefaultContent = async function() {
  try {
    const existingContent = await this.findOne();
    if (!existingContent) {
      console.log('Creating default homepage content...');
      
      const defaultOrder = [
        'heroSection',
        'categoryShowcase',
        'featuredProducts',
        'trustBadges',
        'imageShowcase',
        'parallaxBanner',
        'statsCounter',
        'lookbookGallery',
        'instagramFeed',
        'testimonials'
      ];
      
      const defaultContent = {
        sectionsOrder: defaultOrder,
        heroSection: {
          title: 'Bhuvi Creations',
          titleParts: {
            primary: 'Bhuvi',
            secondary: 'Creations',
            primaryClass: 'hero-title-primary',
            secondaryClass: 'hero-title-secondary'
          },
          subtitle: 'Where Tradition Meets Elegance: Exquisite Indian Wear for Every Occasion.',
          sliderImages: [],
          enabled: true
        },
        categoryShowcase: {
          title: 'Shop by Category',
          subtitle: 'Discover timeless elegance in our curated selection of traditional wear',
          enabled: true
        },
        featuredProducts: {
          title: 'Featured Products',
          subtitle: 'Our handpicked selection of premium products',
          buttonText: 'View All Products',
          limit: 8,
          enabled: true
        },
        parallaxBanner: {
          title: 'Timeless Elegance',
          subtitle: 'Discover our handcrafted collection of traditional Indian wear',
          buttonText: 'Shop Collection',
          buttonLink: '/products',
          backgroundImage: '',
          enabled: true
        },
        statsCounter: {
          title: 'Our Journey in Numbers',
          subtitle: 'Building trust through quality and excellence',
          stats: [
            { number: 25000, suffix: '+', label: 'Happy Customers', icon: 'People' },
            { number: 800, suffix: '+', label: 'Products', icon: 'TrendingUp' },
            { number: 100, suffix: '+', label: 'Cities Served', icon: 'LocationOn' },
            { number: 4.9, suffix: '/5', label: 'Customer Rating', icon: 'Star' }
          ],
          enabled: true
        },
        lookbookGallery: {
          title: 'Style Lookbook',
          subtitle: 'Discover endless style possibilities with our curated fashion gallery',
          enabled: true
        },
        instagramFeed: {
          title: 'Follow Our Journey',
          subtitle: '@bhuvicreations - Daily fashion inspiration and behind-the-scenes',
          buttonText: 'Follow on Instagram',
          instagramLink: 'https://instagram.com/bhuvicreations',
          username: 'bhuvicreations',
          enabled: true
        },
        testimonials: {
          title: 'Customer Stories',
          subtitle: 'Hear from our satisfied customers about their shopping experience',
          enabled: true
        },
        trustBadges: {
          badges: [
            { title: 'Secure Payment', desc: '100% secure transactions', iconType: 'secure' },
            { title: 'Free Shipping', desc: 'On orders above ₹999', iconType: 'shipping' },
            { title: '24/7 Support', desc: 'Always here to help', iconType: 'support' },
            { title: 'Quality Assured', desc: 'Premium quality products', iconType: 'quality' }
          ],
          enabled: true
        },
        imageShowcase: {
          title: 'Our Collection',
          subtitle: 'Discover the beauty of traditional Indian wear',
          images: [],
          enabled: true
        }
      };
      
      const newContent = await this.create(defaultContent);
      console.log('Default homepage content created successfully:', !!newContent);
      return newContent;
    } else {
      console.log('Homepage content already exists');
      return existingContent;
    }
  } catch (error) {
    console.error('Error creating default homepage content:', error);
    throw error;
  }
};

const HomepageContent = mongoose.model('HomepageContent', homepageContentSchema);

module.exports = HomepageContent;