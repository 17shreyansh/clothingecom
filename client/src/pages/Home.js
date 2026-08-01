import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import './Home.css';

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [featuredRes, newArrivalsRes] = await Promise.all([
        api.get('/products/featured'),
        api.get('/products/new-arrivals')
      ]);

      if (featuredRes.data.success) {
        setFeaturedProducts(featuredRes.data.products);
      }
      if (newArrivalsRes.data.success) {
        setNewArrivals(newArrivalsRes.data.products);
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Discover Your Style</h1>
          <p>Explore our latest collection of premium clothing designed for the modern lifestyle</p>
          <Link to="/products" className="btn btn-primary btn-lg">
            Shop Now <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <div className="categories-grid">
            <Link to="/products?categories=men" className="category-card">
              <div className="category-image">
                <img src="/api/placeholder/300/400" alt="Men's Fashion" />
              </div>
              <h3>Men's Fashion</h3>
            </Link>
            <Link to="/products?categories=women" className="category-card">
              <div className="category-image">
                <img src="/api/placeholder/300/400" alt="Women's Fashion" />
              </div>
              <h3>Women's Fashion</h3>
            </Link>
            <Link to="/products?categories=accessories" className="category-card">
              <div className="category-image">
                <img src="/api/placeholder/300/400" alt="Accessories" />
              </div>
              <h3>Accessories</h3>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            <Link to="/products?featured=true" className="view-all-link">
              View All <FiArrowRight />
            </Link>
          </div>
          {loading ? (
            <div className="products-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '400px', borderRadius: '8px' }}></div>
              ))}
            </div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="new-arrivals-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">New Arrivals</h2>
            <Link to="/products?newArrival=true" className="view-all-link">
              View All <FiArrowRight />
            </Link>
          </div>
          {loading ? (
            <div className="products-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '400px', borderRadius: '8px' }}></div>
              ))}
            </div>
          ) : (
            <div className="products-grid">
              {newArrivals.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <h2>Stay Updated</h2>
            <p>Subscribe to our newsletter for exclusive offers and new arrivals</p>
            <form className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email address"
                className="newsletter-input"
              />
              <button type="submit" className="btn btn-primary">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;