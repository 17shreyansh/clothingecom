import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  TextField,
  InputAdornment,
  Avatar,
  Button,
  useMediaQuery,
  useTheme,
  Divider,
  Typography,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Favorite as FavoriteIcon,
  AccountCircle as AccountIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { logo } from '../assets';

const StyledAppBar = styled(AppBar)`
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
  transition: box-shadow 0.3s ease;
`;

const LogoContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0; /* Prevent shrinking on small screens */
  
  img {
    height: 45px;
    width: auto;
    margin-right: 12px;
  }
  
  .brand-text {
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    white-space: nowrap; /* Prevent wrapping */
  }
`;

const NavLinks = styled(Box)`
  display: flex;
  gap: 2rem;
  align-items: center;
  
  @media (max-width: 900px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: #2C2C2C;
  font-weight: 500;
  font-size: 1rem;
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    color: #D4AF37;
  }
  
  &.active {
    color: #D4AF37;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%);
      border-radius: 1px;
    }
  }
`;

const DesktopSearchContainer = styled(motion.div)`
  flex: 1; /* Allows it to take available space */
  max-width: 400px;
  margin: 0 2rem;
  
  @media (max-width: 900px) {
    display: none;
  }
`;

const ActionButtons = styled(Box)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0; /* Prevent shrinking on small screens */
`;

const StyledIconButton = styled(IconButton)`
  color: #2C2C2C !important;
  transition: all 0.3s ease !important;
  
  &:hover {
    background: rgba(212, 175, 55, 0.1) !important;
    color: #D4AF37 !important;
  }
`;

const MobileDrawer = styled(Drawer)`
  .MuiDrawer-paper {
    width: 280px;
    background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%);
    color: white;
    padding-top: 20px;
    box-shadow: 5px 0 15px rgba(0, 0, 0, 0.3);
  }

  .MuiListItem-root {
    color: white;
    &:hover {
      background-color: rgba(255, 255, 255, 0.15);
    }
  }
  .MuiListItemText-primary {
    font-weight: 500;
  }
`;

const MobileSearchBarContainer = styled(motion.div)`
  width: 100%;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: fixed; /* Changed from sticky to fixed */
  top: 64px; /* Adjust based on your AppBar height */
  left: 0; /* Ensure it spans the full width */
  z-index: 1099;

  @media (min-width: 901px) {
    display: none;
  }
`;

const categories = [
  { name: 'Sarees', path: '/products?category=sarees' },
  { name: 'Kurties', path: '/products?category=kurties' },
  { name: 'Lehengas', path: '/products?category=lehengas' },
  { name: 'Suits', path: '/products?category=suits' },
  { name: 'Accessories', path: '/products?category=accessories' }
];

function ModernHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);
  
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setMobileSearchVisible(false);
    }
  }, [isMobile]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileSearchVisible(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuAnchor(null);
    navigate('/');
  };

  const isActiveLink = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path) || location.search.includes(path.split('?category=')[1]);
  };

  const mobileMenu = (
    <MobileDrawer
      anchor="left"
      open={mobileOpen}
      onClose={() => setMobileOpen(false)}
      PaperProps={{
        sx: { width: { xs: '80%', sm: '60%', md: '280px' } }
      }}
    >
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img src={logo} alt="Bhuvi Creations" style={{ height: 80, mixBlendMode: 'multiply' }} />

          </Box>
          <IconButton onClick={() => setMobileOpen(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <List sx={{ flexGrow: 1 }}>
          <ListItem button component={Link} to="/" onClick={() => setMobileOpen(false)}
            sx={{ borderLeft: isActiveLink('/') ? '4px solid white' : 'none' }}>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem button component={Link} to="/products" onClick={() => setMobileOpen(false)}
            sx={{ borderLeft: isActiveLink('/products') ? '4px solid white' : 'none' }}>
            <ListItemText primary="All Products" />
          </ListItem>
          <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.2)' }} />
          {categories.map((category) => (
            <ListItem key={category.name} button component={Link} to={category.path} onClick={() => setMobileOpen(false)}
              sx={{ borderLeft: isActiveLink(category.path) ? '4px solid white' : 'none' }}>
              <ListItemText primary={category.name} />
            </ListItem>
          ))}
          <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.2)' }} />
          <ListItem button component={Link} to="/contact" onClick={() => setMobileOpen(false)}
            sx={{ borderLeft: isActiveLink('/contact') ? '4px solid white' : 'none' }}>
            <ListItemText primary="Contact" />
          </ListItem>
        </List>

        <Box sx={{ p: 2 }}>
            {isAuthenticated ? (
                <>
                    <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.2)' }} />
                    <ListItem button component={Link} to="/profile" onClick={() => setMobileOpen(false)} sx={{ color: 'white' }}>
                        <ListItemText primary="Profile" />
                    </ListItem>
                    <ListItem button component={Link} to="/orders" onClick={() => setMobileOpen(false)} sx={{ color: 'white' }}>
                        <ListItemText primary="Orders" />
                    </ListItem>
                    {user?.role === 'admin' && (
                        <ListItem button component={Link} to="/admin" onClick={() => setMobileOpen(false)} sx={{ color: 'white' }}>
                            <ListItemText primary="Admin Panel" />
                        </ListItem>
                    )}
                    <Button 
                        variant="contained" 
                        fullWidth 
                        onClick={handleLogout} 
                        sx={{ mt: 2, bgcolor: 'white', color: '#D4AF37', '&:hover': { bgcolor: '#f0f0f0' } }}
                    >
                        Logout
                    </Button>
                </>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                    <Button
                        component={Link}
                        to="/login"
                        variant="contained"
                        fullWidth
                        sx={{ bgcolor: 'white', color: '#D4AF37', '&:hover': { bgcolor: '#f0f0f0' } }}
                        onClick={() => setMobileOpen(false)}
                    >
                        Login
                    </Button>
                    <Button
                        component={Link}
                        to="/register"
                        variant="outlined"
                        fullWidth
                        sx={{ borderColor: 'white', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                        onClick={() => setMobileOpen(false)}
                    >
                        Register
                    </Button>
                </Box>
            )}
        </Box>
      </Box>
    </MobileDrawer>
  );

  return (
    <>
      <StyledAppBar position="fixed" elevation={scrolled ? 4 : 1}>
        <Toolbar sx={{ 
          px: { xs: 2, md: 4 }, 
          py: 1, 
          display: 'flex', 
          justifyContent: 'space-between', /* Distribute space between items */
          alignItems: 'center' 
        }}>
          {/* Left Side: Mobile Menu Button + Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {isMobile && (
              <StyledIconButton
                edge="start"
                onClick={() => setMobileOpen(true)}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </StyledIconButton>
            )}

            <LogoContainer
              as={Link}
              to="/"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img src={logo} alt="Bhuvi Creations" />
            </LogoContainer>
          </Box>

          {/* Center: Desktop Navigation (Hidden on Mobile) */}
          {!isMobile && (
            <NavLinks sx={{ flexGrow: 1, justifyContent: 'center' }}> {/* Center nav links on desktop */}
              <NavLink to="/" className={isActiveLink('/') ? 'active' : ''}>
                Home
              </NavLink>
              <NavLink to="/products" className={isActiveLink('/products') ? 'active' : ''}>
                Products
              </NavLink>
              <NavLink to="/products?category=sarees" className={isActiveLink('/products?category=sarees') ? 'active' : ''}>
                Sarees
              </NavLink>
              <NavLink to="/products?category=kurties" className={isActiveLink('/products?category=kurties') ? 'active' : ''}>
                Kurties
              </NavLink>
              <NavLink to="/contact" className={isActiveLink('/contact') ? 'active' : ''}>
                Contact
              </NavLink>
            </NavLinks>
          )}

          {/* Desktop Search (Hidden on Mobile) */}
          <DesktopSearchContainer
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <form onSubmit={handleSearch}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search for sarees, kurties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#666' }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 3,
                    backgroundColor: 'rgba(248, 249, 250, 0.8)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: '1px solid rgba(212, 175, 55, 0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#D4AF37',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#D4AF37',
                    },
                  },
                }}
              />
            </form>
          </DesktopSearchContainer>

          {/* Right Side: Action Buttons */}
          <ActionButtons>
            {/* Mobile Search Icon to toggle search bar */}
            {isMobile && (
              <StyledIconButton onClick={() => setMobileSearchVisible(prev => !prev)}>
                {mobileSearchVisible ? <CloseIcon /> : <SearchIcon />}
              </StyledIconButton>
            )}

            {isAuthenticated && (
              <StyledIconButton component={Link} to="/wishlist">
                <FavoriteIcon />
              </StyledIconButton>
            )}
            
            <StyledIconButton component={Link} to="/cart">
              <Badge badgeContent={itemCount} color="primary">
                <CartIcon />
              </Badge>
            </StyledIconButton>

            {isAuthenticated ? (
              <>
                <StyledIconButton onClick={(e) => setUserMenuAnchor(e.currentTarget)}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#D4AF37' }}>
                    {user?.name?.charAt(0) || 'U'}
                  </Avatar>
                </StyledIconButton>
                <Menu
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={() => setUserMenuAnchor(null)}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem component={Link} to="/profile" onClick={() => setUserMenuAnchor(null)}>
                    Profile
                  </MenuItem>
                  <MenuItem component={Link} to="/orders" onClick={() => setUserMenuAnchor(null)}>
                    Orders
                  </MenuItem>
                  {user?.role === 'admin' && (
                    <MenuItem component={Link} to="/admin" onClick={() => setUserMenuAnchor(null)}>
                      Admin Panel
                    </MenuItem>
                  )}
                  <Divider />
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: '#D4AF37',
                    color: '#D4AF37',
                    '&:hover': {
                      borderColor: '#B8941F',
                      backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    },
                  }}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  size="small"
                >
                  Register
                </Button>
              </Box>
            )}
          </ActionButtons>
        </Toolbar>
      </StyledAppBar>

      {/* Mobile Search Bar (Conditionally Rendered) */}
      <AnimatePresence>
        {isMobile && mobileSearchVisible && (
          <MobileSearchBarContainer
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSearch}>
              <TextField
                fullWidth
                size="medium"
                placeholder="Search for sarees, kurties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#666' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {searchQuery && (
                          <IconButton size="small" onClick={() => setSearchQuery('')}>
                             <CloseIcon sx={{ color: '#666' }} />
                          </IconButton>
                      )}
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 3,
                    backgroundColor: '#fff',
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: '1px solid rgba(212, 175, 55, 0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#D4AF37',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#D4AF37',
                    },
                  },
                }}
                autoFocus
              />
            </form>
          </MobileSearchBarContainer>
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      {mobileMenu}
      
      {/* Spacer for fixed header and mobile search bar */}
      <Toolbar />
      {/* Remove this second Toolbar, as the fixed search bar won't push content */}
      {/* {isMobile && mobileSearchVisible && <Toolbar />} */} 
    </>
  );
}

export default ModernHeader;