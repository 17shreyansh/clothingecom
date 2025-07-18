import React from 'react';
import './ImageShowcase.css';
import image from '../../assets/images/IMG-20240408-WA0236.jpg';
import image2 from '../../assets/images/IMG-20240412-WA0067-scaled.jpg';
import image3 from '../../assets/images/IMG-20240412-WA0088-scaled.jpg';
import image4 from '../../assets/images/IMG-20240416-WA0093.jpg';
import image5 from '../../assets/images/IMG-20240423-WA0147.jpg';
import image6 from '../../assets/images/IMG-20240426-WA0091.jpg';
import image7 from '../../assets/images/IMG-20240426-WA0095.jpg';
import image8 from '../../assets/images/IMG-20240502-WA0060-scaled.jpg';
import image9 from '../../assets/images/iud.webp';

const images = [
  { 
    src: image,
    hoverSrc: image7,
    title: 'Elegant Sarees' 
  },
  { 
    src: image2, 
    hoverSrc: image8,
    title: 'Designer Kurties' 
  },
  { 
    src: image3, 
    hoverSrc: image9,
    title: 'Bridal Collection' 
  },
  { 
    src: image4, 
    hoverSrc: image7,
    title: 'Festive Wear' 
  },
  { 
    src: image5, 
    hoverSrc: image8,
    title: 'Party Wear' 
  },
  { 
    src: image6, 
    hoverSrc: image7,
    title: 'Casual Wear' 
  }
];

const ImageShowcase = ({ data }) => {
  const displayImages = data?.images && data.images.length > 0 ? data.images : images;
  
  return (
    <section className="image-showcase">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{data?.title || 'Our Collection'}</h2>
          <p className="section-subtitle">
            {data?.subtitle || 'Discover the beauty of traditional Indian wear'}
          </p>
        </div>
        
        <div className="showcase-grid">
          {displayImages.map((img, index) => (
            <div 
              key={index} 
              className="image-card"
              style={{
                backgroundImage: `url(${img.src})`,
                '--hover-image': `url(${img.hoverSrc || img.src})`
              }}
            >
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImageShowcase;