import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  AppBar, 
  Toolbar, 
  IconButton,
  Switch,
  FormControlLabel,
  Chip
} from '@mui/material';
import {
  Home as HomeIcon,
  Category as CategoryIcon,
  Star as StarIcon,
  Image as ImageIcon,
  BarChart as StatsIcon,
  Instagram as InstagramIcon,
  RateReview as TestimonialIcon,
  Security as TrustIcon,
  PhotoLibrary as GalleryIcon,
  Landscape as BannerIcon,
  Menu as MenuIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { getHomepageContent, toggleSectionVisibility } from '../../services/homepageService';
import HeroEditor from './editors/HeroEditor';
import CategoryEditor from './editors/CategoryEditor';
import FeaturedProductsEditor from './editors/FeaturedProductsEditor';
import TrustBadgesEditor from './editors/TrustBadgesEditor';
import ImageShowcaseEditor from './editors/ImageShowcaseEditor';
import ParallaxBannerEditor from './editors/ParallaxBannerEditor';
import StatsCounterEditor from './editors/StatsCounterEditor';
import LookbookGalleryEditor from './editors/LookbookGalleryEditor';
import InstagramFeedEditor from './editors/InstagramFeedEditor';
import TestimonialsEditor from './editors/TestimonialsEditor';

const drawerWidth = 280;

const sectionConfig = [
  { key: 'heroSection', label: 'Hero Section', icon: HomeIcon, component: HeroEditor },
  { key: 'categoryShowcase', label: 'Category Showcase', icon: CategoryIcon, component: CategoryEditor },
  { key: 'featuredProducts', label: 'Featured Products', icon: StarIcon, component: FeaturedProductsEditor },
  { key: 'trustBadges', label: 'Trust Badges', icon: TrustIcon, component: TrustBadgesEditor },
  { key: 'imageShowcase', label: 'Image Showcase', icon: ImageIcon, component: ImageShowcaseEditor },
  { key: 'parallaxBanner', label: 'Parallax Banner', icon: BannerIcon, component: ParallaxBannerEditor },
  { key: 'statsCounter', label: 'Stats Counter', icon: StatsIcon, component: StatsCounterEditor },
  { key: 'lookbookGallery', label: 'Lookbook Gallery', icon: GalleryIcon, component: LookbookGalleryEditor },
  { key: 'instagramFeed', label: 'Instagram Feed', icon: InstagramIcon, component: InstagramFeedEditor },
  { key: 'testimonials', label: 'Testimonials', icon: TestimonialIcon, component: TestimonialsEditor }
];

const HomepageEditor = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('heroSection');
  const [homepageContent, setHomepageContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomepageContent();
  }, []);

  const fetchHomepageContent = async () => {
    try {
      const response = await getHomepageContent();
      if (response.success) {
        setHomepageContent(response.data);
      }
    } catch (error) {
      console.error('Error fetching homepage content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSectionToggle = async (sectionKey, enabled) => {
    try {
      await toggleSectionVisibility(sectionKey, enabled);
      setHomepageContent(prev => ({
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          enabled
        }
      }));
    } catch (error) {
      console.error('Error toggling section visibility:', error);
    }
  };

  const updateSectionData = (sectionKey, newData) => {
    setHomepageContent(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        ...newData
      }
    }));
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
          Homepage Editor
        </Typography>
      </Toolbar>
      <List>
        {sectionConfig.map((section) => {
          const IconComponent = section.icon;
          const isActive = activeSection === section.key;
          const isEnabled = homepageContent?.[section.key]?.enabled;
          
          return (
            <ListItem key={section.key} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => setActiveSection(section.key)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    borderRight: '3px solid #D4AF37'
                  }
                }}
              >
                <ListItemIcon>
                  <IconComponent color={isActive ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText 
                  primary={section.label}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Chip 
                        size="small" 
                        label={isEnabled ? 'Active' : 'Disabled'} 
                        color={isEnabled ? 'success' : 'default'}
                        variant="outlined"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={isEnabled || false}
                            onChange={(e) => handleSectionToggle(section.key, e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        }
                        label=""
                        sx={{ m: 0 }}
                      />
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  const ActiveEditor = sectionConfig.find(s => s.key === activeSection)?.component;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: '#fff',
          color: '#333',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {sectionConfig.find(s => s.key === activeSection)?.label} Editor
          </Typography>
          <IconButton color="inherit">
            <SaveIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8
        }}
      >
        {loading ? (
          <Typography>Loading...</Typography>
        ) : ActiveEditor && homepageContent ? (
          <ActiveEditor
            data={homepageContent[activeSection]}
            onUpdate={(newData) => updateSectionData(activeSection, newData)}
            onRefresh={fetchHomepageContent}
          />
        ) : (
          <Typography>Select a section to edit</Typography>
        )}
      </Box>
    </Box>
  );
};

export default HomepageEditor;