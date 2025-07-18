import React, { useState, useEffect } from 'react';
import { getHomepageContent } from '../services/homepageService';

const DataFlowTest = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔍 Testing data flow...');
        const response = await getHomepageContent();
        console.log('✅ Homepage API Response:', response);
        
        if (response.success) {
          setData(response.data);
          console.log('📊 Data received:', {
            heroSection: !!response.data.heroSection,
            categoryShowcase: !!response.data.categoryShowcase,
            featuredProducts: !!response.data.featuredProducts,
            trustBadges: !!response.data.trustBadges,
            imageShowcase: !!response.data.imageShowcase,
            parallaxBanner: !!response.data.parallaxBanner,
            statsCounter: !!response.data.statsCounter,
            lookbookGallery: !!response.data.lookbookGallery,
            instagramFeed: !!response.data.instagramFeed,
            testimonials: !!response.data.testimonials
          });
        }
      } catch (err) {
        console.error('❌ Data fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Testing data flow...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', margin: '20px', borderRadius: '8px' }}>
      <h3>🔍 Data Flow Test Results</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        {Object.entries(data || {}).map(([key, value]) => {
          if (key.startsWith('_') || key === 'createdAt' || key === 'updatedAt' || key === '__v') return null;
          
          return (
            <div key={key} style={{ 
              background: 'white', 
              padding: '10px', 
              borderRadius: '4px',
              border: value?.enabled ? '2px solid green' : '2px solid red'
            }}>
              <strong>{key}</strong>
              <br />
              <small>Enabled: {value?.enabled ? '✅' : '❌'}</small>
              <br />
              <small>Has Data: {Object.keys(value || {}).length > 2 ? '✅' : '❌'}</small>
            </div>
          );
        })}
      </div>

      <details style={{ marginTop: '20px' }}>
        <summary>Raw Data</summary>
        <pre style={{ background: 'white', padding: '10px', overflow: 'auto', fontSize: '12px' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default DataFlowTest;