import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import styled from '@emotion/styled';
import { getCategories } from '../../services/categoriesService';
import logo from '../../assets/logo.png';

// Styled components
const FooterWrapper = styled.footer`
  background: #1a1a1a;
  border-top: 1px solid rgba(212, 175, 55, 0.2);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
  padding: 60px 0 30px 0;
  margin-top: 80px;
`;

const BrandSection = styled.div`
  margin-bottom: 24px;
`;

const BrandLogo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;

  img {
    height: 100px;
    width: auto;
    margin-right: 12px;
    mix-blend-mode: screen;
    filter: invert(1);
    
  }

  .brand-text {
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-family: 'Inter', sans-serif;
  }
`;

const FooterSection = styled.div`
  h3 {
    color: #ffffff;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
    font-family: 'Inter', sans-serif;
  }
`;

const FooterLink = styled(Link)`
  color: #b0b0b0;
  text-decoration: none;
  display: block;
  padding: 6px 0;
  font-size: 14px;
  font-weight: 400;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;

  &:hover {
    color: #D4AF37;
    padding-left: 8px;
    transform: translateX(4px);
  }
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  color: #b0b0b0;
  font-size: 14px;

  .contact-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #D4AF37, #B8941F);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    flex-shrink: 0;
    box-shadow: 0 2px 6px rgba(212, 175, 55, 0.2);

    svg {
      color: white;
      font-size: 16px;
    }
  }

  .contact-text {
    font-family: 'Inter', sans-serif;
    line-height: 1.4;
  }
`;

const SocialButton = styled(IconButton)`
  width: 44px !important;
  height: 44px !important;
  margin-right: 8px !important;
  background: linear-gradient(135deg, #D4AF37, #B8941F) !important;
  color: white !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 2px 6px rgba(212, 175, 55, 0.2) !important;

  &:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3) !important;
  }

  svg {
    font-size: 20px;
  }
`;

const CopyrightSection = styled.div`
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid rgba(212, 175, 55, 0.2);
  text-align: center;

  p {
    color: #b0b0b0;
    font-size: 14px;
    margin: 0;
    font-family: 'Inter', sans-serif;
  }

  .trust-badges {
    margin-top: 8px;
    font-size: 12px;
    color: #888;
  }
`;

// Data
const quickLinks = [
  { name: 'About Us', path: '/about' },
  { name: 'Shipping Info', path: '/shipping' },
  { name: 'Returns & Exchange', path: '/returns' },
  { name: 'Privacy Policy', path: '/privacy' },
  { name: 'Terms of Service', path: '/terms' },
  { name: 'Size Guide', path: '/size-guide' }
];



function ModernFooter() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.categories || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <FooterWrapper>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <BrandSection>
              <BrandLogo>
                <img 
                  src={logo} 
                  alt="Bhuvi Creations Logo" 
                />
              </BrandLogo>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#b0b0b0', 
                  lineHeight: 1.6,
                  marginBottom: 2,
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                Discover exquisite Indian ethnic wear crafted with premium fabrics and traditional artistry. 
                From elegant sarees to stunning lehengas, we bring you timeless fashion with contemporary flair.
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SocialButton href="https://facebook.com" target="_blank" aria-label="Facebook">
                  <FacebookIcon />
                </SocialButton>
                <SocialButton href="https://instagram.com" target="_blank" aria-label="Instagram">
                  <InstagramIcon />
                </SocialButton>
                <SocialButton href="https://twitter.com" target="_blank" aria-label="Twitter">
                  <TwitterIcon />
                </SocialButton>
              </Box>
            </BrandSection>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <FooterSection>
              <h3>Quick Links</h3>
              {quickLinks.map((link) => (
                <FooterLink key={link.name} to={link.path}>
                  {link.name}
                </FooterLink>
              ))}
            </FooterSection>
          </Grid>

          {/* Categories */}
          <Grid item xs={12} sm={6} md={3}>
            <FooterSection>
              <h3>Shop Categories</h3>
              {categories.map((category) => (
                <FooterLink key={category._id} to={`/products?category=${category.slug}`}>
                  {category.name}
                </FooterLink>
              ))}
            </FooterSection>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} md={3}>
            <FooterSection>
              <h3>Get In Touch</h3>
              <ContactItem>
                <div className="contact-icon">
                  <LocationIcon />
                </div>
                <div className="contact-text">
                  Lajpat Nagar, Sahibabad<br />
                  Ghaziabad, UP - 201005<br />
                  India
                </div>
              </ContactItem>
              <ContactItem>
                <div className="contact-icon">
                  <PhoneIcon />
                </div>
                <div className="contact-text">
                  +91 9560540494<br />
                  Mon-Sat: 10 AM - 8 PM
                </div>
              </ContactItem>
              <ContactItem>
                <div className="contact-icon">
                  <EmailIcon />
                </div>
                <div className="contact-text">
                  bhuvicreations22@gmail.com<br />
                  info@bhuvicreations.com
                </div>
              </ContactItem>
            </FooterSection>
          </Grid>
        </Grid>

        {/* Copyright Section */}
        <CopyrightSection>
          <p>© {new Date().getFullYear()} Bhuvi Creations. All rights reserved.</p>
          <div className="trust-badges">
            Secure Payments • Fast Delivery • Quality Guaranteed • Easy Returns
          </div>
        </CopyrightSection>
      </Container>
    </FooterWrapper>
  );
}

export default ModernFooter;