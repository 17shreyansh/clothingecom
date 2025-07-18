import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/products/user/wishlist');
      if (response.data.success) {
        setWishlist(response.data.wishlist);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="grid grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '400px', borderRadius: '8px' }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ marginBottom: '2rem' }}>My Wishlist</h1>
      
      {wishlist.length === 0 ? (
        <div className="text-center" style={{ padding: '4rem 0' }}>
          <FiHeart size={64} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h2>Your wishlist is empty</h2>
          <p>Add some products to your wishlist</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-4">
          {wishlist.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;