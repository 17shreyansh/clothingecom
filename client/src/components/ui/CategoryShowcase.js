import React, { useState, useEffect } from 'react';
import './CategoryShowcase.css';
import { img1, img2, img3, img4 } from '../../assets';
import api from '../../services/api';

const defaultCategories = [
  { name: 'Sarees', image: img1, link: '/products?category=saree', count: '120+ Styles' },
  { name: 'Kurties', image: img2, link: '/products?category=kurtie', count: '85+ Styles' },
  { name: 'Lehengas', image: img3, link: '/products?category=lehenga', count: '65+ Styles' },
  { name: 'Suits', image: img4, link: '/products?category=suit', count: '95+ Styles' }
];

const CategoryShowcase = ({ data }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      if (response.data.success && response.data.categories.length > 0) {
        const dynamicCategories = response.data.categories
          .filter(cat => cat.isActive)
          .slice(0, data?.maxDisplay || 4)
          .map(cat => ({
            name: cat.name,
            image: cat.image || defaultCategories.find(d => d.name.toLowerCase() === cat.name.toLowerCase())?.image || img1,
            link: `/products?category=${cat.slug || cat.name.toLowerCase()}`,
            count: cat.productCount ? `${cat.productCount}+ Styles` : ''
          }));
        setCategories(dynamicCategories.length > 0 ? dynamicCategories : defaultCategories);
      } else {
        setCategories(data?.categories || defaultCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(data?.categories || defaultCategories);
    } finally {
      setLoading(false);
    }
  };

  const displayCategories = data?.categories && data.categories.length > 0 ? data.categories : categories;

  return (
    <section className="category-showcase">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{data?.title || 'Shop by Category'}</h2>
          <p className="section-subtitle">
            {data?.subtitle || 'Discover timeless elegance in our curated selection of traditional wear'}
          </p>
        </div>

        <div className="categories-grid">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="category-card skeleton">
                <div className="category-image skeleton-img"></div>
                <div className="category-name skeleton-text"></div>
              </div>
            ))
          ) : (
            displayCategories.map((category, index) => (
              <div 
                key={category.name || index} 
                className="category-card"
                onClick={() => window.location.href = category.link}
                style={{ height: '100%' }}
              >
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="category-image"
                  onError={(e) => {
                    e.target.src = img1;
                  }}
                />
                <h3 className="category-name">{category.name}</h3>
                {category.count && <span className="category-count">{category.count}</span>}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;