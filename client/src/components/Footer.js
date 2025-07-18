import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>StyleHub</h3>
            <p>Your destination for modern fashion and style. Quality clothing for every occasion.</p>
            <div className="contact-info">
              <div className="contact-item">
                <FiMail />
                <span>support@stylehub.com</span>
              </div>
              <div className="contact-item">
                <FiPhone />
                <span>+91 98765 43210</span>
              </div>
              <div className="contact-item">
                <FiMapPin />
                <span>Mumbai, India</span>
              </div>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/products?category=men">Men's Fashion</Link></li>
              <li><Link to="/products?category=women">Women's Fashion</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Customer Service</h4>
            <ul>
              <li><Link to="/contact">Help Center</Link></li>
              <li><a href="#returns">Returns & Exchanges</a></li>
              <li><a href="#shipping">Shipping Info</a></li>
              <li><a href="#size-guide">Size Guide</a></li>
              <li><a href="#track-order">Track Your Order</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Newsletter</h4>
            <p>Subscribe to get updates on new arrivals and exclusive offers.</p>
            <form className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email"
                className="newsletter-input"
              />
              <button type="submit" className="btn btn-primary">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 StyleHub. All rights reserved.</p>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#cookies">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;